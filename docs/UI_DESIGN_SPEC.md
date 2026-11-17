# UI & Visual Design Specification

## Color Palette & State Semantics (Strict Consistency Across All Components)

- **Backgrounds:** App Canvas `#090d16` (`bg-[#090d16]`), Cards/Panels `#0f172a` (`bg-slate-900/90`), Borders `border-slate-800`
- **Node & Edge State Colors:**
  - **Initial State (`A`):** Emerald (`#10b981` / `emerald-500`)
  - **Goal State (`D` / `G` / `F`):** Rose (`#f43f5e` / `rose-500`)
  - **Active / Current Expanding Node:** Amber (`#f59e0b` / `amber-400` with glow ring)
  - **Frontier (In Queue/Stack/PQ):** Sky Blue (`#38bdf8` / `sky-400`)
  - **Explored / Visited:** Slate (`#475569` / `slate-600`)
  - **Final Shortest/Optimal Path:** Bright Green (`#22c55e` / `green-500`, thick animated stroke)
  - **Blocked Road/Corridor:** Red Dashed (`#ef4444` / `red-500`, `strokeDasharray: '5 5'`)

## Layout Proportions (`src/App.tsx`)

- **Top Header Bar:** Project title, Scenario Switcher (`Campus`, `Hospital`, `City`), Algorithm Selector (`BFS`, `DFS`, `UCS`, `A*`), and `"Architecture & Formal Model"` button[cite: 7, 8].
- **Left/Center Main Stage (65% width):** Interactive Knowledge Graph Canvas (`GraphCanvas`) + Search Tree Trace (`SearchTreeCanvas`)[cite: 7, 8].
- **Right Sidebar (35% width):** Formal Problem Formulation & Live Frontier/Queue Inspector (`ProblemInspector`)[cite: 1, 7, 8].
- **Bottom Dock:** Playback Controls (`PlaybackControls`: Play, Pause, Step Back, Step Forward, Reset, Scrubber, Speed)[cite: 7, 8].
