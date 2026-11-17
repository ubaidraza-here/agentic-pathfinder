import { useEffect, useRef, useState } from "react";

type ModalTab = "model" | "architecture" | "sequence";

const diagrams: Record<ModalTab, string> = {
  model: `flowchart TD
    M["M = (S, s0, G, A, T, c, h)"]
    M --> S["S: Finite state set"]
    M --> I["s0: Initial state"]
    M --> G["G: Goal state set"]
    M --> A["A(s): Available actions"]
    M --> T["T(s,a): State transition"]
    M --> C["c: Positive edge cost"]
    M --> H["h(n): Estimated remaining cost"]
    T --> P["Successor and path cost"]
    P --> Q["Search frontier"]`,
  architecture: `flowchart LR
    D["SCENARIOS"] --> E["searchEngine.ts"]
    E --> X["ExecutionStep[]"]
    X --> G["GraphCanvas"]
    X --> T["SearchTreeCanvas"]
    X --> I["ProblemInspector"]
    X --> P["PlaybackControls"]
    A["ArchitectureModal"] --> F["Formal model"]
    A --> C["Architecture diagram"]
    A --> K["Call-flow diagram"]`,
  sequence: `sequenceDiagram
    actor User
    participant App
    participant Engine as searchEngine.ts
    participant UI as Dashboard Components
    User->>App: Select scenario or algorithm
    App->>Engine: generateExecutionSteps()
    Engine-->>App: ExecutionStep[]
    App->>App: currentIndex=0
    App->>UI: Render current ExecutionStep
    loop Playback
      User->>App: Play or step
      App->>App: Update currentIndex
      App->>UI: Graph, tree, inspector update
    end
    User->>App: Click edge
    App->>Engine: Recompute with updated scenario
    Engine-->>App: ExecutionStep[]`,
};

const tabLabels: Record<ModalTab, string> = {
  model: "Formal Model",
  architecture: "Component Architecture",
  sequence: "Call Flow",
};

export function ArchitectureModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ModalTab>("model");
  const [renderError, setRenderError] = useState("");
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !diagramRef.current) return;

    let cancelled = false;
    const renderDiagram = async () => {
      setRenderError("");
      try {
        const { default: mermaid } = await import("mermaid");
        if (cancelled) return;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
        });
        const id = `architecture-mermaid-${activeTab}-${Date.now()}`;
        const { svg } = await mermaid.render(id, diagrams[activeTab]);
        if (!cancelled && diagramRef.current) {
          diagramRef.current.innerHTML = svg;
        }
      } catch (error: unknown) {
        if (!cancelled) {
          console.error("Failed to load or render the architecture diagram.", error);
          setRenderError(
            error instanceof Error
              ? `Unable to render this diagram: ${error.message}`
              : "Unable to load the diagram renderer. The rest of the application is still available.",
          );
        }
      }
    };

    void renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="architecture-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[88vh] w-[95vw] max-w-5xl flex-col overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/95 p-4 shadow-2xl sm:p-6">
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Documentation
            </p>
            <h2 id="architecture-modal-title" className="mt-1 text-lg font-semibold text-white">
              Architecture &amp; Formal Model
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            Close
          </button>
        </header>

        <div className="flex min-w-0 overflow-x-auto border-b border-slate-800" role="tablist" aria-label="Architecture documentation sections">
          {(Object.keys(tabLabels) as ModalTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition ${
                activeTab === tab
                  ? "border-sky-400 text-sky-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-auto py-4 sm:py-5">
          {activeTab === "model" && (
            <section className="mb-5 rounded-md border border-slate-800 bg-[#0f172a] p-4 text-sm text-slate-200">
              <h3 className="text-base font-semibold text-white">Formal System Model</h3>
              <p className="mt-2">
                M = {"<"}S, s0, G, A, T, c, h{">"}, where S is the finite state space,
                s0 is the initial state, G is the goal set, A(s) defines available moves,
                T is the state transition, c is positive edge cost, and h estimates
                remaining cost to the goal.
              </p>
              <p className="mt-2">
                T(s, move(s,u)) = u for an open undirected edge. The goal test succeeds
                when the current state equals the scenario goal.
              </p>
              <p className="mt-2">
                A* evaluation: f(n) = g(n) + h(n). A successor is accepted only when
                g(successor) improves; positive edge costs prevent cycle cost regressions.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-300">
                      <th className="px-2 py-2">Algorithm</th>
                      <th className="px-2 py-2">Time Complexity</th>
                      <th className="px-2 py-2">Space Complexity</th>
                      <th className="px-2 py-2">Optimality</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-800">
                      <td className="px-2 py-2">BFS</td>
                      <td className="px-2 py-2">O(V + E)</td>
                      <td className="px-2 py-2">O(V)</td>
                      <td className="px-2 py-2">Minimum hops</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="px-2 py-2">DFS</td>
                      <td className="px-2 py-2">O(V + E)</td>
                      <td className="px-2 py-2">O(V)</td>
                      <td className="px-2 py-2">Not guaranteed</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="px-2 py-2">UCS</td>
                      <td className="px-2 py-2">O((V + E) log V)</td>
                      <td className="px-2 py-2">O(V)</td>
                      <td className="px-2 py-2">Optimal</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2">A*</td>
                      <td className="px-2 py-2">O((V + E) log V) worst case</td>
                      <td className="px-2 py-2">O(V) worst case</td>
                      <td className="px-2 py-2">Optimal with admissible h</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {renderError ? (
            <div className="rounded-md border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-300">
              {renderError}
            </div>
          ) : (
            <div
              ref={diagramRef}
              className="min-h-72 min-w-0 w-full overflow-x-auto rounded-md border border-slate-800 bg-[#090d16] p-3 sm:p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
