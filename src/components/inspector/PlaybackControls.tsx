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
    <div className="flex min-h-16 flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/95 px-3 py-2 text-slate-100 sm:flex-nowrap sm:gap-2 sm:px-6">
      <button
        type="button"
        onClick={onTogglePlay}
        disabled={steps.length === 0}
        className="min-w-0 flex-1 rounded-md bg-indigo-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-20 sm:flex-none sm:px-3 sm:text-sm"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        type="button"
        onClick={() => onStepChange(Math.max(0, currentIndex - 1))}
        disabled={!canStepBack}
        className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950/60 px-2 py-2 text-xs transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-3 sm:text-sm"
      >
        Step Back
      </button>

      <button
        type="button"
        onClick={() => onStepChange(Math.min(lastIndex, currentIndex + 1))}
        disabled={!canStepForward}
        className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950/60 px-2 py-2 text-xs transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-3 sm:text-sm"
      >
        Step Forward
      </button>

      <button
        type="button"
        onClick={onReset}
        className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950/60 px-2 py-2 text-xs transition hover:border-slate-500 sm:flex-none sm:px-3 sm:text-sm"
      >
        Reset
      </button>

      <div className="order-first flex w-full min-w-0 items-center gap-3 sm:order-none sm:flex-1">
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

      <label className="ml-auto flex shrink-0 items-center gap-2 text-xs text-slate-400">
        Speed
        <select
          value={speedMs}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="max-w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-100 sm:max-w-none sm:text-sm"
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
