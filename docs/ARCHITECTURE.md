# System Architecture & Component Contracts

## Data Flow Pipeline

`ScenarioDefinition (src/data/scenarios.ts)`
──▶ `runSearchAlgorithm(scenario, algorithm) (src/engine/searchEngine.ts)`
──▶ `ExecutionStep[]` (Array of deterministic state snapshots)
──▶ Consumed simultaneously by: 1. `GraphCanvas.tsx` & `SearchTreeCanvas.tsx` (`src/components/visualizer/`) 2. `ProblemInspector.tsx` & `PlaybackControls.tsx` (`src/components/inspector/`)

## Required Component Exports & Props (Exact Signatures)

1. **Engine (`src/engine/searchEngine.ts`):**
   - `export function generateExecutionSteps(scenario: ScenarioDefinition, algorithm: AlgorithmType): ExecutionStep[]`
2. **Visualizer (`src/components/visualizer/`):**
   - `GraphCanvas`: `{ scenario: ScenarioDefinition; currentStep: ExecutionStep; onToggleEdgeBlock: (edgeId: string) => void; onUpdateEdgeCost: (edgeId: string, cost: number) => void; }`
   - `SearchTreeCanvas`: `{ currentStep: ExecutionStep; }`
3. **Inspector (`src/components/inspector/`):**
   - `ProblemInspector`: `{ scenario: ScenarioDefinition; algorithm: AlgorithmType; currentStep: ExecutionStep; }`
   - `PlaybackControls`: `{ steps: ExecutionStep[]; currentIndex: number; isPlaying: boolean; speedMs: number; onStepChange: (idx: number) => void; onTogglePlay: () => void; onReset: () => void; onSpeedChange: (ms: number) => void; }`
4. **Docs Modal (`src/components/docs-modal/ArchitectureModal.tsx`):**
   - `ArchitectureModal`: `{ isOpen: boolean; onClose: () => void; }`
