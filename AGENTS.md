# AGENTS.md — Master Repository Constitution & AI Coding Rules

## 1. Project Overview

We are building an **Agentic State-Space Search & Knowledge Graph Visualizer** (React + TypeScript + Vite + Tailwind CSS + `@xyflow/react` + `mermaid`).
The application models goal-based AI agents solving state-space navigation problems from our AI Lab Assignment (Smart Campus, Hospital Emergency, Smart City Traffic)[cite: 1, 3, 5] with interactive graph & search-tree trace execution[cite: 7, 8], algorithm step playback (BFS, DFS, UCS, A\*)[cite: 7, 8], formal problem formulation inspection[cite: 1, 7, 8], and formal system architecture/call-flow documentation[cite: 7, 8].

## 2. Mandatory Pre-Execution Reading

Before generating or modifying ANY code, every AI agent MUST read:

1. `AGENTS.md` (this file)
2. `src/types/graph.ts` (strict TypeScript interfaces — DO NOT alter without Lead Architect approval)
3. `docs/ARCHITECTURE.md` (module boundaries & component interfaces)
4. `docs/SCENARIOS_SPEC.md` (exact lab manual nodes, edges, and Python graphs)[cite: 1, 2, 3, 4, 5, 6]

## 3. Strict Module Ownership (Zero Merge Conflict Rule)

Each team member works on a dedicated Git branch and may ONLY create/edit files inside their owned paths:

| Member                      | Roll No.      | Git Branch                   | Owned Paths                                                               |
| :-------------------------- | :------------ | :--------------------------- | :------------------------------------------------------------------------ |
| **Ubaid Raza** (Lead)       | `CSC-25F-013` | `feat/search-engine-core`    | `src/data/`, `src/engine/`, `src/App.tsx`                                 |
| **Anushka Samad** (Co-Lead) | `CSC-25F-083` | `feat/graph-tree-visualizer` | `src/components/visualizer/`                                              |
| **Danyal Hassan**           | `CSC-25F-032` | `feat/state-inspector-ui`    | `src/components/inspector/`                                               |
| **Laiba Khan**              | `CSC-25F-024` | `feat/docs-and-diagrams`     | `docs/FORMAL_MODEL.md`, `docs/CALL_FLOW.md`, `src/components/docs-modal/` |

**CRITICAL BOUNDARY RULE:** Never edit files outside your assigned directory. Import shared types exclusively from `src/types/graph.ts`.

## 4. Coding & UI Standards

- Use strict TypeScript (no `any` types).
- Use dark-mode slate/indigo/emerald/amber Tailwind utility classes for clean visual contrast.
- All algorithms (`BFS`, `DFS`, `UCS`, `ASTAR`) must emit an array of `ExecutionStep` frames so the UI can step forward, step backward, pause, and inspect the frontier and search tree at every state transition[cite: 7, 8].
