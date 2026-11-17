import type {
  AlgorithmType,
  ExecutionStep,
  ScenarioDefinition,
} from "../../types/graph";

function getDataStructureName(algorithm: AlgorithmType): string {
  if (algorithm === "BFS") return "Queue";
  if (algorithm === "DFS") return "Stack";
  if (algorithm === "UCS") return "Priority Queue (g(n))";
  return "Priority Queue (f(n))";
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
  const stateIds = scenario.nodes.map((node) => node.id).join(", ");
  const openEdges = scenario.edges.filter((edge) => !edge.blocked);
  const dataStructureName = getDataStructureName(algorithm);

  return (
    <aside className="w-full min-w-0 rounded-lg border border-slate-800 bg-slate-900/90 p-3 text-slate-100 sm:p-4 lg:h-full lg:overflow-y-auto">
      <section aria-labelledby="formal-model-heading">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Formal AI Problem
          </p>
          <h2 id="formal-model-heading" className="mt-1 text-lg font-semibold text-white">
            {scenario.title}
          </h2>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
            <dt className="font-semibold text-emerald-400">Initial State</dt>
            <dd className="mt-1 text-slate-200">
              {scenario.initialState} — {scenario.nodes.find((node) => node.id === scenario.initialState)?.label}
            </dd>
          </div>
          <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
            <dt className="font-semibold text-rose-400">Goal State</dt>
            <dd className="mt-1 text-slate-200">
              {scenario.goalState} — {scenario.nodes.find((node) => node.id === scenario.goalState)?.label}
            </dd>
          </div>
          <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
            <dt className="font-semibold text-sky-400">State Space (S)</dt>
            <dd className="mt-1 break-words text-slate-200">{"{" + stateIds + "}"}</dd>
          </div>
          <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
            <dt className="font-semibold text-sky-400">Actions (A(s))</dt>
            <dd className="mt-1 text-slate-200">{scenario.actionsDescription}</dd>
          </div>
          <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
            <dt className="font-semibold text-sky-400">Transition Model (T(s,a))</dt>
            <dd className="mt-1 text-slate-200">
              {scenario.transitionModelDescription} Open edges: {openEdges.map((edge) => edge.id).join(", ") || "none"}.
            </dd>
          </div>
          <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
            <dt className="font-semibold text-rose-400">Goal Test</dt>
            <dd className="mt-1 text-slate-200">
              Return true when state = {scenario.goalState}.
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 border-t border-slate-800 pt-4" aria-labelledby="data-inspector-heading">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="data-inspector-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Data Structure Inspector
          </h3>
          <span className="rounded border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs text-sky-300">
            {dataStructureName}
          </span>
        </div>

        <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-400">Frontier</span>
            <span className="text-slate-400">{currentStep.frontier.length} entries</span>
          </div>
          {currentStep.frontier.length === 0 ? (
            <p className="text-xs italic text-slate-500">Empty</p>
          ) : (
            <div className="space-y-1.5">
              {currentStep.frontier.map((entry) => (
                <div
                  key={entry.treeId}
                  className="grid grid-cols-[auto_1fr] gap-2 rounded border border-sky-500/20 bg-sky-500/5 px-2 py-1.5 text-xs"
                >
                  <span className="font-bold text-sky-300">{entry.stateId}</span>
                  <span className="text-right text-slate-300">
                    g={entry.g} · h={entry.h} · f={entry.f}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
            <div className="text-xs font-semibold text-slate-400">Explored IDs</div>
            <div className="mt-2 min-h-5 text-sm text-slate-200">
              {currentStep.exploredIds.length > 0
                ? currentStep.exploredIds.join(", ")
                : "None"}
            </div>
          </div>
          <div className="rounded-md border border-slate-800 bg-[#0f172a] p-3">
            <div className="text-xs font-semibold text-slate-400">Total Path Cost</div>
            <div className="mt-2 text-sm font-semibold text-green-400">
              {currentStep.totalPathCost}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-md border border-slate-800 bg-[#0f172a] p-3">
          <div className="text-xs font-semibold text-slate-400">Action Log</div>
          <p className="mt-2 text-sm leading-5 text-slate-200">
            {currentStep.actionLog || "Waiting for execution."}
          </p>
        </div>

        {currentStep.goalReached && (
          <div className="mt-3 rounded-md border border-green-500/40 bg-green-950/30 p-3">
            <div className="text-xs font-semibold uppercase text-green-400">Goal Reached</div>
            <p className="mt-1 text-sm text-slate-200">
              {currentStep.finalPath.join(" → ") || "No path recorded"}
            </p>
          </div>
        )}
      </section>
    </aside>
  );
}
