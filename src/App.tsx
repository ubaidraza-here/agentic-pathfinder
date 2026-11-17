import { useEffect, useMemo, useState } from "react";
import { SCENARIOS } from "./data/scenarios";
import { generateExecutionSteps } from "./engine/searchEngine";
import { GraphCanvas } from "./components/visualizer/GraphCanvas";
import { SearchTreeCanvas } from "./components/visualizer/SearchTreeCanvas";
import { ProblemInspector } from "./components/inspector/ProblemInspector";
import { PlaybackControls } from "./components/inspector/PlaybackControls";
import { ArchitectureModal } from "./components/docs-modal/ArchitectureModal";
import type {
  AlgorithmType,
  ScenarioDefinition,
} from "./types/graph";

export function App() {
  type StageView = "graph" | "tree" | "split";
  const [stageView, setStageView] =
    useState<StageView>("split");
  const [scenarioId, setScenarioId] =
    useState<ScenarioDefinition["id"]>("campus");
  const [algorithm, setAlgorithm] =
    useState<AlgorithmType>("BFS");
  const [scenario, setScenario] =
    useState<ScenarioDefinition>(SCENARIOS[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = useMemo(
    () => generateExecutionSteps(scenario, algorithm),
    [scenario, algorithm],
  );
  const safeIndex = steps.length === 0
    ? 0
    : Math.min(currentIndex, steps.length - 1);
  const currentStep = steps[safeIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [scenarioId, algorithm, scenario.edges]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => {
        if (index >= steps.length - 1) {
          setIsPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs, steps.length]);

  const selectScenario = (id: ScenarioDefinition["id"]) => {
    const selected = SCENARIOS.find((item) => item.id === id);
    if (!selected) return;
    setScenario(selected);
    setScenarioId(id);
  };

  const toggleEdgeBlock = (edgeId: string) => {
    setScenario((previous) => ({
      ...previous,
      edges: previous.edges.map((edge) =>
        edge.id === edgeId
          ? { ...edge, blocked: !edge.blocked }
          : edge,
      ),
    }));
  };

  const updateEdgeCost = (edgeId: string, cost: number) => {
    if (!Number.isFinite(cost) || cost < 1) return;
    setScenario((previous) => ({
      ...previous,
      edges: previous.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, cost } : edge,
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <header className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <div>
          <div className="text-sm font-bold tracking-wide">
            Agentic State-Space Pathfinder
          </div>
          <div className="text-xs text-slate-500">
            Graph &amp; Search-Tree Visualizer
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={scenarioId}
            onChange={(event) =>
              selectScenario(
                event.target.value as ScenarioDefinition["id"],
              )
            }
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            aria-label="Scenario"
          >
            <option value="campus">Campus</option>
            <option value="hospital">Hospital</option>
            <option value="city">City</option>
          </select>
          <select
            value={algorithm}
            onChange={(event) =>
              setAlgorithm(event.target.value as AlgorithmType)
            }
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            aria-label="Algorithm"
          >
            <option value="BFS">BFS</option>
            <option value="DFS">DFS</option>
            <option value="UCS">UCS</option>
            <option value="ASTAR">A*</option>
          </select>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded border border-indigo-500/50 bg-indigo-950/40 px-3 py-2 text-sm text-indigo-200"
          >
            Architecture &amp; Formal Model
          </button>
        </div>
      </header>

      {currentStep && (
        <main className="grid h-[calc(100vh-64px)] grid-cols-[65%_35%] gap-3 p-3 pb-20">
          <section className="min-h-0">
            <div className="mb-2 flex h-10 items-center rounded-lg border border-slate-800 bg-slate-900/90 p-1">
              {([
                ["graph", "Knowledge Graph"],
                ["tree", "Search Tree Trace"],
                ["split", "Side-by-Side Split"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setStageView(mode)}
                  className={`h-8 flex-1 rounded-md px-3 text-xs font-semibold transition ${
                    stageView === mode
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {stageView === "graph" && (
              <div className="h-[calc(100%-48px)]">
                <GraphCanvas
                  scenario={scenario}
                  currentStep={currentStep}
                  onToggleEdgeBlock={toggleEdgeBlock}
                  onUpdateEdgeCost={updateEdgeCost}
                />
              </div>
            )}

            {stageView === "tree" && (
              <div className="h-[calc(100%-48px)]">
                <SearchTreeCanvas currentStep={currentStep} />
              </div>
            )}

            {stageView === "split" && (
              <div className="grid h-[calc(100%-48px)] grid-cols-[58%_42%] gap-3">
                <GraphCanvas
                  scenario={scenario}
                  currentStep={currentStep}
                  onToggleEdgeBlock={toggleEdgeBlock}
                  onUpdateEdgeCost={updateEdgeCost}
                />
                <SearchTreeCanvas currentStep={currentStep} />
              </div>
            )}
          </section>
          <ProblemInspector
            scenario={scenario}
            algorithm={algorithm}
            currentStep={currentStep}
          />
        </main>
      )}

      {steps.length > 0 && (
        <div className="fixed bottom-3 left-3 right-3 z-20">
          <PlaybackControls
            steps={steps}
            currentIndex={safeIndex}
            isPlaying={isPlaying}
            speedMs={speedMs}
            onStepChange={(index) => {
              setIsPlaying(false);
              setCurrentIndex(
                Math.max(0, Math.min(index, steps.length - 1)),
              );
            }}
            onTogglePlay={() => setIsPlaying((playing) => !playing)}
            onReset={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            onSpeedChange={setSpeedMs}
          />
        </div>
      )}

      <ArchitectureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default App;
