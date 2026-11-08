# Graph Report - CarNaviLauncher  (2026-11-08)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 112 nodes · 176 edges · 10 communities (3 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5

## God Nodes (most connected - your core abstractions)
1. `MainActivity` - 18 edges
2. `initEventListeners()` - 14 edges
3. `CarNaviBridge` - 12 edges
4. `loadTrack()` - 7 edges
5. `WebChromeClient` - 6 edges
6. `with` - 6 edges
7. `WebViewClient` - 5 edges
8. `renderPlaylist()` - 5 edges
9. `saveSettings()` - 5 edges
10. `steps` - 5 edges

## Surprising Connections (you probably didn't know these)
- `MainActivity` --references--> `WebView`  [EXTRACTED]
  app/src/main/java/com/carnavi/launcher/MainActivity.kt →   _Bridges community 2 → community 1_

## Import Cycles
- None detected.

## Communities (10 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (26): closeMediaPanel(), closeSettingsModal(), dom, escapeHtml(), formatTime(), initAudio(), initClock(), initEventListeners() (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (10): runs-on, jobs, build, name, on, pull_request, push, workflow_dispatch (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (10): steps, name, run, uses, with, cache, distribution, java-version (+2 more)

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MainActivity` connect `Community 2` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `initEventListeners()` (e.g. with `closeSettingsModal()` and `playNextTrack()`) actually correct?**
  _`initEventListeners()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08262108262108261 - nodes in this community are weakly interconnected._
- **Why does `CarNaviBridge` connect `Community 3` to `Community 2`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `steps` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._