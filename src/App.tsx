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
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="w-full sm:w-auto">
          <div className="text-sm font-bold tracking-wide">
            Agentic State-Space Pathfinder
          </div>
          <div className="text-xs text-slate-500">
            Graph &amp; Search-Tree Visualizer
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:gap-3">
          <select
            value={scenarioId}
            onChange={(event) =>
              selectScenario(
                event.target.value as ScenarioDefinition["id"],
              )
            }
            className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm sm:flex-none"
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
            className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm sm:flex-none"
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
            className="w-full rounded border border-indigo-500/50 bg-indigo-950/40 px-3 py-2 text-sm text-indigo-200 sm:w-auto"
          >
            Architecture &amp; Formal Model
          </button>
        </div>
      </header>

      {currentStep && (
        <main className="flex min-h-screen flex-col gap-3 overflow-y-auto p-3 pb-28 lg:h-[calc(100vh-132px)] lg:min-h-0 lg:flex-row lg:gap-0 lg:overflow-hidden lg:p-4">
          <section
            className={`w-full lg:w-[65%] ${
              stageView === "split"
                ? "h-auto lg:h-full"
                : "h-[420px] sm:h-[500px] lg:h-full"
            }`}
          >
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
              <div className="flex flex-col gap-3 md:flex-row lg:h-[calc(100%-48px)]">
                <div className="h-[360px] w-full md:flex-[58] md:min-w-0 lg:h-full">
                  <GraphCanvas
                    scenario={scenario}
                    currentStep={currentStep}
                    onToggleEdgeBlock={toggleEdgeBlock}
                    onUpdateEdgeCost={updateEdgeCost}
                  />
                </div>
                <div className="h-[360px] w-full md:flex-[42] md:min-w-0 lg:h-full">
                  <SearchTreeCanvas currentStep={currentStep} />
                </div>
              </div>
            )}
          </section>
          <div className="w-full lg:w-[35%] lg:min-w-0">
            <ProblemInspector
              scenario={scenario}
              algorithm={algorithm}
              currentStep={currentStep}
            />
          </div>
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
