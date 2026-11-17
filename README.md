# Agentic State-Space Pathfinder & Knowledge Graph Visualizer

An interactive, agent-oriented state-space search and pathfinding visualizer built with **React, TypeScript, Tailwind CSS, and React Flow**. Designed and developed using an **Agentic AI Engineering Workflow** (`AGENTS.md` multi-agent boundary architecture) for our Artificial Intelligence Lab assignment[cite: 7, 8].

---

## Team Members & Module Ownership

| Member Name                   | Roll Number   | Git Branch                   | Assigned Module & Responsibility                                                                             |
| :---------------------------- | :------------ | :--------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Ubaid Raza** _(Lead)_       | `CSC-25F-013` | `feat/search-engine-core`    | Core Types, Scenario Data, Search Algorithms Engine (BFS, DFS, UCS, A\*) & App Integration[cite: 7, 8]       |
| **Anushka Samad** _(Co-Lead)_ | `CSC-25F-083` | `feat/graph-tree-visualizer` | Interactive State-Space Knowledge Graph & Live Search Tree Trace Visualizer[cite: 7, 8]                      |
| **Danyal Hassan**             | `CSC-25F-032` | `feat/state-inspector-ui`    | Formal Problem Formulation Inspector, Live Frontier/Queue Monitor & Playback Controls[cite: 1, 7, 8]         |
| **Laiba Khan**                | `CSC-25F-024` | `feat/docs-and-diagrams`     | Formal System Model, Call Flow & Architecture Diagrams (Mermaid.js) & In-App Documentation Modal[cite: 7, 8] |

---

## Core Features

1. **Multi-Scenario State-Space Modeling:**
   - **Scenario 1:** Smart Campus Navigation (`Main Gate` $\rightarrow$ `CS Department`)[cite: 1]
   - **Scenario 2:** Hospital Emergency Navigation (`Emergency Entrance` $\rightarrow$ `ICU`)[cite: 3]
   - **Scenario 3:** Smart City Traffic Navigation (`Police Station` $\rightarrow$ `City Hospital`)[cite: 5]
2. **Step-by-Step Search Algorithms & Cost Evaluation:**
   - **Breadth-First Search (BFS)** — Uninformed FIFO frontier expansion[cite: 7, 8]
   - **Depth-First Search (DFS)** — Uninformed LIFO stack exploration[cite: 7, 8]
   - **Uniform Cost Search (UCS)** — Optimal path discovery ordered by path cost $g(n)$
   - **A\* Search** — Informed heuristic search ordered by $f(n) = g(n) + h(n)$[cite: 8]
3. **Dual Interactive Visualization:**
   - **Knowledge Graph Canvas:** Real-time node state highlighting (Initial, Goal, Current, Frontier, Explored, Optimal Path) plus interactive edge blocking and cost editing[cite: 1, 7, 8].
   - **Search Tree Trace:** Dynamic hierarchical expansion tree tracking parent-child transitions and costs at every step[cite: 7, 8].
4. **Formal System Model & Architecture:**
   - Embedded Mermaid.js component diagrams, sequence call flows, and formal mathematical tuple definitions ($M = \langle S, s_0, G, A, T, c, h \rangle$)[cite: 7, 8].

---

## Getting Started (Local Setup)

```bash
# 1. Clone the repository
git clone [https://github.com/ubaidraza-here/agentic-pathfinder.git](https://github.com/ubaidraza-here/agentic-pathfinder.git)
cd agentic-pathfinder

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```
