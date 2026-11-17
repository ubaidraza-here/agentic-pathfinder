import { useEffect, useMemo, useState } from "react";
import { SCENARIOS } from "./data/scenarios";
import { generateExecutionSteps } from "./engine/searchEngine";
import type {
  AlgorithmType,
  ExecutionStep,
  ScenarioDefinition,
} from "./types/graph";

export function GraphCanvas({
  scenario,
  currentStep,
  onToggleEdgeBlock,
}: {
  scenario: ScenarioDefinition;
  currentStep: ExecutionStep;
  onToggleEdgeBlock: (edgeId: string) => void;
  onUpdateEdgeCost: (edgeId: string, cost: number) => void;
}) {
  return (
    <div className="relative h-full min-h-[260px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
      <svg viewBox="0 0 880 600" className="h-full w-full" role="img" aria-label="Knowledge graph">
        {scenario.edges.map((edge) => {
          const source = scenario.nodes.find((node) => node.id === edge.source);
          const target = scenario.nodes.find((node) => node.id === edge.target);
          if (!source || !target) return null;
          const onPath = currentStep.finalPath.includes(source.id)
            && currentStep.finalPath.includes(target.id)
            && Math.abs(
              currentStep.finalPath.indexOf(source.id)
              - currentStep.finalPath.indexOf(target.id),
            ) === 1;
          return (
            <g key={edge.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edge.blocked ? "#ef4444" : onPath ? "#22c55e" : "#475569"}
                strokeWidth={onPath ? 5 : 2}
                strokeDasharray={edge.blocked ? "5 5" : undefined}
                className="cursor-pointer"
                onClick={() => onToggleEdgeBlock(edge.id)}
              />
              <rect
                x={(source.x + target.x) / 2 - 11}
                y={(source.y + target.y) / 2 - 10}
                width="22"
                height="20"
                rx="5"
                fill="#0f172a"
              />
              <text
                x={(source.x + target.x) / 2}
                y={(source.y + target.y) / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fill="#cbd5e1"
              >
                {edge.cost}
              </text>
              <title>{`${edge.id}: ${edge.cost}${edge.blocked ? " (blocked)" : ""}`}</title>
            </g>
          );
        })}
        {scenario.nodes.map((node) => {
          const isCurrent = currentStep.currentNodeId === node.id;
          const isFrontier = currentStep.frontier.some((entry) => entry.stateId === node.id);
          const isExplored = currentStep.exploredIds.includes(node.id);
          const fill = node.category === "Initial"
            ? "#10b981"
            : node.category === "Goal"
              ? "#f43f5e"
              : isCurrent
                ? "#f59e0b"
                : isFrontier
                  ? "#38bdf8"
                  : isExplored
                    ? "#475569"
                    : "#1e293b";
          return (
            <g key={node.id}>
              {isCurrent && (
                <circle cx={node.x} cy={node.y} r="31" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.8" />
              )}
              <circle cx={node.x} cy={node.y} r="24" fill={fill} stroke="#e2e8f0" strokeWidth="2" />
              <text x={node.x} y={node.y + 5} textAnchor="middle" fill="white" fontWeight="700">{node.id}</text>
              <text x={node.x} y={node.y + 46} textAnchor="middle" fill="#cbd5e1" fontSize="12">{node.label}</text>
            </g>
          );
        })}
      </svg>
      {scenario.edges.some((edge) => edge.blocked) && (
        <div className="absolute bottom-3 left-3 rounded-md border border-red-500/40 bg-red-950/70 px-3 py-1 text-xs text-red-300">
          Blocked roads are red and dashed
        </div>
      )}
    </div>
  );
}

export function SearchTreeCanvas({ currentStep }: { currentStep: ExecutionStep }) {
  const maxDepth = Math.max(0, ...currentStep.searchTree.map((node) => node.depth));
  return (
    <div className="h-[210px] overflow-auto rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Search Tree Trace</div>
      <div className="relative min-h-[150px]" style={{ width: `${Math.max(700, (maxDepth + 1) * 150)}px` }}>
        <svg className="absolute inset-0 h-full w-full">
          {currentStep.searchTree.map((node) => {
            if (!node.parentTreeId) return null;
            const parent = currentStep.searchTree.find((item) => item.treeId === node.parentTreeId);
            if (!parent) return null;
            const px = 70 + parent.depth * 150;
            const py = 42 + currentStep.searchTree.filter((item) => item.depth === parent.depth).indexOf(parent) * 70;
            const nx = 70 + node.depth * 150;
            const ny = 42 + currentStep.searchTree.filter((item) => item.depth === node.depth).indexOf(node) * 70;
            return (
              <line
                key={`${parent.treeId}-${node.treeId}`}
                x1={px}
                y1={py}
                x2={nx}
                y2={ny}
                stroke="#475569"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        {currentStep.searchTree.map((node) => {
          const x = 70 + node.depth * 150;
          const siblings = currentStep.searchTree.filter((item) => item.depth === node.depth);
          const y = 42 + siblings.indexOf(node) * 70;
          const fill = node.status === "path"
            ? "#22c55e"
            : node.status === "current"
              ? "#f59e0b"
              : node.status === "frontier"
                ? "#38bdf8"
                : "#475569";
          return (
            <div
              key={node.treeId}
              className="absolute flex h-12 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-slate-600 text-xs"
              style={{ left: x, top: y, backgroundColor: fill }}
              title={`${node.treeId} g=${node.pathCost} h=${node.heuristic} f=${node.totalCost}`}
            >
              {node.stateId}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProblemInspector({
  scenario,
  algorithm,
  currentStep,
}: {
  scenario: ScenarioDefinition;
  algorithm: AlgorithmType;
  currentStep: ExecutionStep;
}) {
  return (
    <aside className="overflow-auto rounded-lg border border-slate-800 bg-slate-900/90 p-4">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Problem Formulation</div>
        <h2 className="mt-1 text-lg font-semibold">{scenario.title}</h2>
      </div>
      <dl className="space-y-3 text-sm">
        <div><dt className="text-slate-400">Initial State</dt><dd>{scenario.initialState}</dd></div>
        <div><dt className="text-slate-400">Goal State</dt><dd>{scenario.goalState}</dd></div>
        <div><dt className="text-slate-400">Algorithm</dt><dd>{algorithm === "ASTAR" ? "A*" : algorithm}</dd></div>
        <div><dt className="text-slate-400">Objective</dt><dd>{scenario.agentObjective}</dd></div>
      </dl>
      <div className="my-4 border-t border-slate-800" />
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Frontier</span>
        <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs text-sky-300">{currentStep.frontier.length}</span>
      </div>
      <div className="space-y-2">
        {currentStep.frontier.map((entry) => (
          <div key={entry.treeId} className="grid grid-cols-[1fr_auto] rounded border border-slate-800 px-3 py-2 text-sm">
            <span>{entry.stateId}</span>
            <span className="text-slate-400">g {entry.g} · h {entry.h} · f {entry.f}</span>
          </div>
        ))}
      </div>
      {currentStep.goalReached && (
        <div className="mt-4 rounded border border-green-500/40 bg-green-950/40 p-3">
          <div className="text-sm font-semibold text-green-400">Goal reached</div>
          <div className="mt-1 text-xs text-slate-300">Path: {currentStep.finalPath.join(" → ")}</div>
          <div className="text-xs text-slate-300">Cost: {currentStep.totalPathCost}</div>
        </div>
      )}
    </aside>
  );
}

export function PlaybackControls({
  steps,
  currentIndex,
  isPlaying,
  speedMs,
  onStepChange,
  onTogglePlay,
  onReset,
  onSpeedChange,
}: {
  steps: ExecutionStep[];
  currentIndex: number;
  isPlaying: boolean;
  speedMs: number;
  onStepChange: (idx: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (ms: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-3">
      <button type="button" onClick={onReset} className="rounded border border-slate-700 px-3 py-2 text-sm">Reset</button>
      <button type="button" onClick={() => onStepChange(Math.max(0, currentIndex - 1))} className="rounded border border-slate-700 px-3 py-2 text-sm">Back</button>
      <button type="button" onClick={onTogglePlay} className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold">{isPlaying ? "Pause" : "Play"}</button>
      <button type="button" onClick={() => onStepChange(Math.min(steps.length - 1, currentIndex + 1))} className="rounded border border-slate-700 px-3 py-2 text-sm">Forward</button>
      <input
        type="range"
        min={0}
        max={Math.max(0, steps.length - 1)}
        value={currentIndex}
        onChange={(event) => onStepChange(Number(event.target.value))}
        className="min-w-32 flex-1"
      />
      <select
        value={speedMs}
        onChange={(event) => onSpeedChange(Number(event.target.value))}
        className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
        aria-label="Playback speed"
      >
        <option value={1500}>Slow</option>
        <option value={800}>Normal</option>
        <option value={300}>Fast</option>
      </select>
    </div>
  );
}

export function ArchitectureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Architecture &amp; Formal Model</div>
            <h2 className="mt-1 text-xl font-semibold">Agentic State-Space Search Pipeline</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-slate-700 px-3 py-1">Close</button>
        </div>
        <pre className="mt-5 overflow-auto rounded bg-slate-950 p-4 text-sm text-slate-300">
{`ScenarioDefinition
  -> generateExecutionSteps(scenario, algorithm)
  -> ExecutionStep[]
  -> GraphCanvas + SearchTreeCanvas
  -> ProblemInspector + PlaybackControls`}
        </pre>
      </div>
    </div>
  );
}

export function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioDefinition["id"]>("campus");
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("BFS");
  const [scenario, setScenario] = useState<ScenarioDefinition>(SCENARIOS[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = useMemo(() => generateExecutionSteps(scenario, algorithm), [scenario, algorithm]);
  const currentStep = steps[currentIndex] ?? steps[0];

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [scenarioId, algorithm]);

  useEffect(() => {
    if (!isPlaying) return;
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
    setScenarioId(id);
    setScenario(selected);
  };

  const toggleEdgeBlock = (edgeId: string) => {
    setScenario((previous) => ({
      ...previous,
      edges: previous.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, blocked: !edge.blocked } : edge,
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <header className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <div>
          <div className="text-sm font-bold tracking-wide">Agentic State-Space Pathfinder</div>
          <div className="text-xs text-slate-500">Graph &amp; Search-Tree Visualizer</div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={scenarioId}
            onChange={(event) => selectScenario(event.target.value as ScenarioDefinition["id"])}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            aria-label="Scenario"
          >
            <option value="campus">Campus</option>
            <option value="hospital">Hospital</option>
            <option value="city">City</option>
          </select>
          <select
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value as AlgorithmType)}
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
          <section className="grid min-h-0 grid-rows-[minmax(280px,1fr)_210px] gap-3">
            <GraphCanvas
              scenario={scenario}
              currentStep={currentStep}
              onToggleEdgeBlock={toggleEdgeBlock}
              onUpdateEdgeCost={() => undefined}
            />
            <SearchTreeCanvas currentStep={currentStep} />
          </section>
          <ProblemInspector scenario={scenario} algorithm={algorithm} currentStep={currentStep} />
        </main>
      )}

      {steps.length > 0 && (
        <div className="fixed bottom-3 left-3 right-3 z-20">
          <PlaybackControls
            steps={steps}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            speedMs={speedMs}
            onStepChange={(index) => {
              setIsPlaying(false);
              setCurrentIndex(index);
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

      <ArchitectureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;
