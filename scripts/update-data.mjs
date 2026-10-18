import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import { projects, projectMatches } from '../src/catalog.js'

export const sources = { apps: 'https://analytics.home-assistant.io/addons.json', integrations: 'https://analytics.home-assistant.io/custom_integrations.json', context: 'https://analytics.home-assistant.io/current_data.json' }
export function validateDataset(value, kind) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.keys(value).length) throw new Error(`${kind}: empty or invalid dataset`)
  for (const [id, entry] of Object.entries(value)) {
    if (!id || !entry || !Number.isSafeInteger(entry.total) || entry.total < 0 || !entry.versions || typeof entry.versions !== 'object' || Array.isArray(entry.versions)) throw new Error(`${kind}: invalid entry ${id}`)
    for (const count of Object.values(entry.versions)) if (!Number.isSafeInteger(count) || count < 0) throw new Error(`${kind}: invalid version count ${id}`)
    if (kind === 'apps') for (const field of ['auto_update', 'protected']) if (!Number.isSafeInteger(entry[field]) || entry[field] < 0) throw new Error(`${kind}: invalid ${field} ${id}`)
  }
  return value
}
export function updateHistory(previous, datasets, now = new Date()) {
  const day = now.toISOString().slice(0, 10)
  const cutoff = new Date(now.getTime() - 364 * 86400000).toISOString().slice(0, 10)
  const result = { schemaVersion: 1, apps: {}, integrations: {} }
  for (const kind of ['apps', 'integrations']) {
    for (const [id, entries] of Object.entries(previous[kind] || {})) {
      const valid = Object.fromEntries(Object.entries(entries).filter(([date, count]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= cutoff && date <= day && Number.isSafeInteger(count) && count >= 0))
      if (Object.keys(valid).length) result[kind][id] = valid
    }
    for (const [id, entry] of Object.entries(datasets[kind])) {
      result[kind][id] ||= {}
      result[kind][id][day] = entry.total
    }
  }
  return result
}
export function badge(value) {
  const label = 'HA Installationen', text = value == null ? 'noch nicht gemeldet' : new Intl.NumberFormat('de-DE').format(value)
  const width = value == null ? 157 : Math.max(46, text.length * 8 + 18), left = 122
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${left + width}" height="26" role="img" aria-label="${label}: ${text}"><title>${label}: ${text}</title><clipPath id="r"><rect width="${left + width}" height="26" rx="5"/></clipPath><g clip-path="url(#r)"><path fill="#334155" d="M0 0h${left}v26H0z"/><path fill="#193b69" d="M${left} 0h${width}v26H${left}z"/></g><g fill="#fff" font-family="Verdana,DejaVu Sans,sans-serif" font-size="10" text-anchor="middle"><text x="${left / 2}" y="17">${label}</text><text x="${left + width / 2}" y="17">${text}</text></g></svg>`
}
async function fetchSource(url) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'homeassistant-app-stats/1.0 (+https://github.com/seb5594/homeassistant-app-stats)', Accept: 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
      return { data: await response.json(), fetchedAt: new Date().toISOString(), lastModified: response.headers.get('last-modified'), url }
    } catch (error) { lastError = error; if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1))) }
  }
  throw lastError
}
async function atomicJson(file, data) { await mkdir(resolve(file, '..'), { recursive: true }); await writeFile(`${file}.tmp`, JSON.stringify(data), 'utf8'); await rename(`${file}.tmp`, file) }
export async function main() {
  const root = resolve('public'), dataDir = join(root, 'data'), historyFile = resolve('.cache/history.json.gz')
  // Validate every source before replacing any data. A failed refresh leaves the published site untouched.
  const results = await Promise.all(Object.entries(sources).map(async ([kind, url]) => [kind, await fetchSource(url)]))
  const fetched = Object.fromEntries(results)
  const datasets = { apps: validateDataset(fetched.apps.data, 'apps'), integrations: validateDataset(fetched.integrations.data, 'integrations') }
  if (!Number.isSafeInteger(fetched.context.data.active_installations) || fetched.context.data.active_installations <= 0) throw new Error('Invalid Home Assistant installation context')
  let previous = {}
  try { previous = JSON.parse(gunzipSync(await readFile(historyFile)).toString('utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
  const history = updateHistory(previous, datasets)
  const days = new Set(Object.values(history.apps).flatMap(entry => Object.keys(entry)))
  const metadata = { schemaVersion: 1, collectedAt: new Date().toISOString(), activeInstallations: fetched.context.data.active_installations, contextUpdatedAt: fetched.context.data.last_updated, historyDays: days.size, sources: Object.fromEntries(results.map(([key, value]) => [key, { fetchedAt: value.fetchedAt, lastModified: value.lastModified, url: value.url }])) }
  await atomicJson(join(dataDir, 'apps.json'), datasets.apps)
  await atomicJson(join(dataDir, 'custom_integrations.json'), datasets.integrations)
  await atomicJson(join(dataDir, 'metadata.json'), metadata)
  // Serve only the selected project's history, keeping the browser payload small as the archive grows.
  for (const kind of ['apps', 'integrations']) {
    await mkdir(join(dataDir, 'history', kind), { recursive: true })
    const list = Object.entries(history[kind])
    for (let index = 0; index < list.length; index += 100) await Promise.all(list.slice(index, index + 100).map(([id, values]) => atomicJson(join(dataDir, 'history', kind, `entry-${encodeURIComponent(id)}.json`), values)))
  }
  await mkdir(join(root, 'badges'), { recursive: true })
  for (const project of projects) {
    const entries = Object.entries(datasets[project.kind]).map(([id, entry]) => ({ ...entry, id }))
    const entry = entries.find(e => projectMatches(e, project))
    await writeFile(join(root, 'badges', `${project.id}.svg`), badge(entry?.total), 'utf8')
  }
  await mkdir(resolve(historyFile, '..'), { recursive: true })
  await writeFile(`${historyFile}.tmp`, gzipSync(JSON.stringify(history), { level: 9 }))
  await rename(`${historyFile}.tmp`, historyFile)
  console.log(`Updated ${Object.keys(datasets.apps).length} apps and ${Object.keys(datasets.integrations).length} integrations. ${days.size} observed days.`)
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { console.error(error); process.exitCode = 1 })
