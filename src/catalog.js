export const repository = 'https://github.com/seb5594/homeassistant-app-stats'
export const pageUrl = 'https://seb5594.github.io/homeassistant-app-stats/'
export const projects = [
  { id: 'git-exporter', legacyStores: ['d46539d0'], name: 'Git Exporter', kind: 'apps', slug: 'git-exporter', repo: 'Home-Assistant-git-exporter-Addon', description: 'Deine Konfiguration. Sicher im Git-Repository.', icon: 'git', color: 'blue' },
  { id: 'rsync-local', legacyStores: ['81f86f9d'], name: 'Rsync Local', kind: 'apps', slug: 'rsync-local', repo: 'Home-Assistant-Rsync-Local-Addon', description: 'Lokale Backups auf deinem USB-Laufwerk.', icon: 'drive', color: 'teal' },
  { id: 'sony_playstation_vr_camera_loader', name: 'PlayStation VR Camera', kind: 'apps', slug: 'sony_playstation_vr_camera_loader', repo: 'Home-Assistant-Playstation-VR-Camera-Loader-App', description: 'Eine neue Aufgabe für deine PlayStation-Kamera.', icon: 'camera', color: 'violet' },
  { id: 'ninebot_e_scooters', name: 'Ninebot E-Scooters', kind: 'integrations', repo: 'hass-ninebot_e_scooters-integration', description: 'Dein E-Scooter wird Teil deines Smart Homes.', icon: 'bike', color: 'blue' },
  { id: 'pulseaudio_loopback', name: 'PulseAudio Loopback Extended', kind: 'integrations', repo: 'hass-pulseaudio_loopback_extended-integration', description: 'Mehr Möglichkeiten für dein Audio-Setup.', icon: 'audio', color: 'teal' },
  { id: 'vacuum_mapguard', name: 'Vacuum MapGuard', kind: 'integrations', repo: 'hass-vacuum_mapguard-integration', description: 'Die richtige Karte für deinen Saugroboter.', icon: 'map', color: 'violet' },
]
const names = {
  core_mosquitto: 'Mosquitto broker', core_configurator: 'File editor', core_samba: 'Samba share', core_matter_server: 'Matter Server', core_ssh: 'Terminal & SSH', core_zwave_js: 'Z-Wave JS', core_whisper: 'Whisper', core_piper: 'Piper', core_openwakeword: 'openWakeWord',
  a0d7b954_ssh: 'Advanced SSH & Web Terminal', a0d7b954_nodered: 'Node-RED', a0d7b954_vscode: 'Studio Code Server', a0d7b954_adguard: 'AdGuard Home', a0d7b954_nginxproxymanager: 'Nginx Proxy Manager', a0d7b954_grafana: 'Grafana', a0d7b954_influxdb: 'InfluxDB', a0d7b954_glances: 'Glances',
  hacs: 'HACS', xiaomi_home: 'Xiaomi Home', xiaomi_miot: 'Xiaomi MIoT', localtuya: 'LocalTuya', tuya_local: 'Tuya Local', browser_mod: 'Browser Mod', alarmo: 'Alarmo', powercalc: 'Powercalc', watchman: 'Watchman', adaptive_lighting: 'Adaptive Lighting', smartir: 'SmartIR',
}
export function displayName(id) {
  if (names[id]) return names[id]
  const project = projects.find(p => id === p.id || (p.slug && id.endsWith(`_${p.slug}`)))
  if (project) return project.name
  return id.replace(/^(?:[a-f0-9]{8}|core|local)_/, '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
export function projectMatches(entry, project) {
  // Supervisor hashes the lowercase store URL; never count other stores as this author's installs.
  return project.kind === 'integrations' ? entry.id === project.id
    : ['4c7fee11', ...(project.legacyStores || [])].some(store => entry.id === `${store}_${project.slug}`)
}
