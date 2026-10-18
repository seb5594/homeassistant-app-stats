# HA Observatory

**Home Assistant. In Zahlen.**

Ein modernes, offenes Dashboard für Home-Assistant-Apps, Add-ons und Custom Integrations. Entdecke gemeldete Installationen, Versionsverteilungen und die Entwicklung deiner Projekte – mit teilbaren Ansichten und README-Badges.

[Dashboard öffnen](https://seb5594.github.io/homeassistant-app-stats/) · [Meine Projekte](https://seb5594.github.io/homeassistant-app-stats/?view=projects) · [Offizielle Datenquelle](https://analytics.home-assistant.io/)

## Neue Repository-Description

> Beautiful, shareable analytics for Home Assistant apps and custom integrations. Track adoption, explore versions, and give your open-source projects a home in numbers.

## Funktionen

- Getrennte, per Tastatur bedienbare Tabs für Apps/Add-ons und Custom Integrations.
- Suche nach Namen, Slug oder Domain; exakte App-Store-Filter; Sortierung nach Nutzung oder Name.
- Kontextbezogene Kennzahlen, Versionsverteilungen und vollständige Versionstabellen.
- Eigene tägliche Installationsverläufe für 30, 90 oder 365 Tage mit tabellarischen Messwerten.
- Hell-/Dunkelmodus, responsive Oberfläche und reduzierte Animationen bei entsprechender Systemeinstellung.
- Teilbare Ansichten, CSV-Export, sechs vorbereitete Projektseiten und aktualisierte SVG-Badges.
- Selbst gehostete Schriftarten; keine zusätzlichen Besucher-Tracker oder externen Schriften-Anfragen.

## Daten mit Kontext

| Inhalt | Offizielle Quelle |
| --- | --- |
| Apps & Add-ons | https://analytics.home-assistant.io/addons.json |
| Custom Integrations | https://analytics.home-assistant.io/custom_integrations.json |
| Meldende HA-Installationen | https://analytics.home-assistant.io/current_data.json |

Die Teilnahme an Home Assistant Analytics ist freiwillig. Die Zahlen sind keine vollständige Erhebung aller Installationen. Summen über Projekte können dieselbe HA-Installation mehrfach zählen. Eine fehlende Domain oder ein fehlender Slug bedeutet **nicht**, dass ein Projekt keine Nutzer hat.

Versionsanteile beziehen sich auf die Summe der Versionsmeldungen; diese kann von der Gesamtzahl abweichen. Die meistgenutzte Version muss nicht die neueste veröffentlichte Version sein. Auto-Update und geschützter Modus werden nur für Apps ausgewiesen.

Der eigene Verlauf beginnt mit dem ersten erfolgreichen Abruf. Vorherige Zeiträume werden nicht rekonstruiert oder simuliert. Entfernte Projekte behalten ihre bisherigen Punkte bis zum Ablauf der Aufbewahrung; fehlende Meldungen werden nicht als null interpretiert. Die Seite zeigt die Abrufzeit und eine Warnung nach 48 Stunden ohne Aktualisierung.

## GitHub Pages einrichten

1. In **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** auswählen.
2. In **Actions** die Workflows für diesen Fork aktivieren, falls GitHub sie noch deaktiviert hat.
3. Den Workflow **Build and deploy Observatory** manuell starten oder Änderungen auf `main` pushen.

Der Workflow testet die Anwendung, lädt und validiert alle drei Quellen, erstellt den Build und veröffentlicht ihn über die offiziellen Pages-Actions. Er läuft außerdem täglich um **04:17 UTC**. Ein fehlgeschlagener Datenabruf ersetzt keine veröffentlichte Seite.

Der separate Branch `data` speichert das komprimierte Verlaufsarchiv (`history.json.gz`) mit maximal 365 Tagen. Er enthält keinen Anwendungscode und darf für einen kontinuierlichen Verlauf nicht gelöscht werden. Die Frontend-Dateien enthalten kleine, projektweise Verlaufsdateien, die erst bei Auswahl geladen werden. Der Workflow verwendet `GITHUB_TOKEN`; eigene API-Schlüssel werden nicht benötigt.

GitHub kann tägliche Workflows öffentlicher Repositorys nach längerer Inaktivität deaktivieren. Bei veralteten Zahlen den Workflow-Status prüfen und gegebenenfalls wieder aktivieren.

## Lokale Entwicklung

Voraussetzung: Node.js 24 LTS und npm.

```sh
npm ci
npm run data
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

`npm run data` legt aktuelle Daten unter `public/data/` und Badges unter `public/badges/` ab. Das lokale Archiv liegt in `.cache/history.json.gz`. Diese Dateien sind generiert und werden nicht auf `main` versioniert. `npm run build` benötigt keinen Netzwerkzugriff; vor einer Veröffentlichung müssen die Statistikdaten einmal erzeugt worden sein.

Vite verwendet relative Asset-Pfade. Der Build funktioniert sowohl unter `/homeassistant-app-stats/` als auch unter einer eigenen Domain. Navigation und Filter verwenden Query-Parameter, sodass direkte Links ohne zusätzliche Server-Rewrites funktionieren.

## Links und Badges für deine Repositorys

Alte Filterlinks bleiben kompatibel:

```text
https://seb5594.github.io/homeassistant-app-stats/?filter=68413af6
```

| Parameter | Bedeutung |
| --- | --- |
| `tab=integrations` | Custom Integrations anzeigen (Standard: Apps) |
| `filter=...` | Name, Slug oder Domain durchsuchen |
| `store=4c7fee11` | Exakter App-Store |
| `item=core_mosquitto` | Datensatz auswählen |
| `project=vacuum_mapguard` | Ein vorbereitetes eigenes Projekt auswählen |
| `days=30` / `90` / `365` | Verlaufszeitraum |
| `view=projects` | Eigene Projekte und Badge-Generator |

Vorbereitete Links und Markdown-Snippets stehen in [docs/repository-links.md](docs/repository-links.md). Sie lassen sich auf der Seite unter **Meine Projekte → README-Badge einbetten** kopieren.

Eigene Projekte werden in `src/catalog.js` konfiguriert. Für Apps setzt sich die Analytics-ID aus Store-Hash und App-Slug zusammen. Der Supervisor berechnet den Store-Hash als die ersten acht Zeichen des SHA-1 der kleingeschriebenen Store-URL. Der aktuelle Store `https://github.com/seb5594/Home-Assistant-Apps` ergibt `4c7fee11`; zusätzlich werden die bekannten eigenen Einzel-Repositorys berücksichtigt. Statistiken aus Poeschls Store werden nicht deinen Projekten zugerechnet. Custom Integrations werden über die exakte Domain aus `manifest.json` zugeordnet.

## Technik und Farbpalette

Vue 3 mit Composition API, Vite 8 / Rolldown, Chart.js 4 und Lucide. Bootstrap, Sass, Icon-Fonts und der bisherige Tracking-Code wurden entfernt.

Die gemeinsame JavaScript-Farbpalette steht in `src/palette.js`:

```js
['#193b69', '#4e87d5', '#55b5ad', '#8c80c7', '#e0af58', '#88b9e5', '#99aaba', '#bbc5d2']
```

## Danke, Poeschl

Die Inspiration und ursprüngliche Grundlage stammen von **[Poeschls Home Assistant Addon Stats](https://github.com/Poeschl/homeassistant-addon-stats)**. Dieser Fork entwickelt die Idee mit einer neuen Oberfläche, Custom Integrations und eigenen Datenpipelines weiter. Danke für die offene Arbeit und den Anstoß zu diesem Projekt.

Die ursprüngliche **Apache License 2.0** bleibt erhalten. Siehe [LICENCE](LICENCE) und [NOTICE](NOTICE). Home Assistant ist ein Projekt der Open Home Foundation; dieses Dashboard ist ein unabhängiges Community-Projekt.
