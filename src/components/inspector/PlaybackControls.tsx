import type { ExecutionStep } from "../../types/graph";

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
  const lastIndex = Math.max(0, steps.length - 1);
  const canStepBack = currentIndex > 0;
  const canStepForward = currentIndex < lastIndex;

  return (
    <div className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/95 px-4 py-3 text-slate-100">
      <button
        type="button"
        onClick={onTogglePlay}
        disabled={steps.length === 0}
        className="min-w-20 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        type="button"
        onClick={() => onStepChange(Math.max(0, currentIndex - 1))}
        disabled={!canStepBack}
        className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Step Back
      </button>

      <button
        type="button"
        onClick={() => onStepChange(Math.min(lastIndex, currentIndex + 1))}
        disabled={!canStepForward}
        className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Step Forward
      </button>

      <button
        type="button"
        onClick={onReset}
        className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm transition hover:border-slate-500"
      >
        Reset
      </button>

      <div className="flex min-w-32 flex-1 items-center gap-3">
        <span className="shrink-0 text-xs text-slate-400">
          {currentIndex}/{lastIndex}
        </span>
        <input
          type="range"
          min={0}
          max={lastIndex}
          step={1}
          value={currentIndex}
          onChange={(event) => onStepChange(Number(event.target.value))}
          disabled={steps.length === 0}
          aria-label="Execution step"
          className="h-2 w-full cursor-pointer accent-sky-400 disabled:cursor-not-allowed"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-400">
        Speed
        <select
          value={speedMs}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100"
          aria-label="Execution speed"
        >
          <option value={200}>200ms</option>
          <option value={500}>500ms</option>
          <option value={1000}>1000ms</option>
        </select>
      </label>
    </div>
  );
}
