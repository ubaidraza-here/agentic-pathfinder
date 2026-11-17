import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

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
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "strict",
    });
  }, []);

  useEffect(() => {
    if (!isOpen || !diagramRef.current) return;

    let cancelled = false;
    const renderDiagram = async () => {
      setRenderError("");
      try {
        const id = `architecture-mermaid-${activeTab}-${Date.now()}`;
        const { svg } = await mermaid.render(id, diagrams[activeTab]);
        if (!cancelled && diagramRef.current) {
          diagramRef.current.innerHTML = svg;
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setRenderError(
            error instanceof Error ? error.message : "Unable to render diagram.",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="architecture-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/95 shadow-2xl">
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

        <div className="flex border-b border-slate-800 px-5" role="tablist" aria-label="Architecture documentation sections">
          {(Object.keys(tabLabels) as ModalTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-3 text-sm transition ${
                activeTab === tab
                  ? "border-sky-400 text-sky-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {activeTab === "model" && (
            <section className="mb-5 rounded-md border border-slate-800 bg-[#0f172a] p-4 text-sm text-slate-200">
              <h3 className="text-base font-semibold text-white">Formal System Model</h3>
              <p className="mt-2">
                M = (S, s0, G, A, T, c, h), where S is the finite state space,
                s0 is the initial state, G is the goal set, A(s) defines available moves,
                T is the state transition, c is positive edge cost, and h estimates
                remaining cost to the goal.
              </p>
              <p className="mt-2">
                T(s, move(s,u)) = u for an open undirected edge. The goal test succeeds
                when the current state equals the scenario goal.
              </p>
            </section>
          )}

          {renderError ? (
            <div className="rounded-md border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-300">
              {renderError}
            </div>
          ) : (
            <div
              ref={diagramRef}
              className="min-h-72 overflow-x-auto rounded-md border border-slate-800 bg-[#090d16] p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
