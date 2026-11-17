import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ExecutionStep } from "../../types/graph";

export function SearchTreeCanvas({
  currentStep,
}: {
  currentStep: ExecutionStep;
}) {
  const treeById = new Map(
    currentStep.searchTree.map((treeNode) => [treeNode.treeId, treeNode]),
  );

  const activeBranchIds = new Set<string>();
  let activeTreeId = currentStep.currentTreeId;
  while (activeTreeId) {
    activeBranchIds.add(activeTreeId);
    activeTreeId = treeById.get(activeTreeId)?.parentTreeId ?? null;
  }

  const siblingCounts = new Map<number, number>();
  currentStep.searchTree.forEach((treeNode) => {
    siblingCounts.set(treeNode.depth, (siblingCounts.get(treeNode.depth) ?? 0) + 1);
  });

  const siblingIndexes = new Map<number, number>();
  const nodes: Node[] = currentStep.searchTree.map((treeNode) => {
    const siblingIndex = siblingIndexes.get(treeNode.depth) ?? 0;
    siblingIndexes.set(treeNode.depth, siblingIndex + 1);
    const siblingCount = siblingCounts.get(treeNode.depth) ?? 1;
    const x = (siblingIndex - (siblingCount - 1) / 2) * 150;
    const y = treeNode.depth * 95;

    let background = "#475569";
    let border = "#94a3b8";
    let boxShadow: string | undefined;

    if (treeNode.status === "frontier") {
      background = "#38bdf8";
      border = "#7dd3fc";
    } else if (treeNode.status === "current" || treeNode.treeId === currentStep.currentTreeId) {
      background = "#f59e0b";
      border = "#fde68a";
      boxShadow = "0 0 16px 4px rgba(245, 158, 11, 0.7)";
    } else if (treeNode.status === "path") {
      background = "#22c55e";
      border = "#86efac";
    }

    return {
      id: treeNode.treeId,
      position: { x, y },
      data: {
        label: (
          <div className="w-[120px] p-2 text-center">
            <div className="text-sm font-bold text-white">{treeNode.stateId}</div>
            <div className="mt-1 text-[11px] font-mono leading-tight text-slate-200">
              g={treeNode.pathCost} h={treeNode.heuristic} f={treeNode.totalCost}
            </div>
          </div>
        ),
      },
      style: {
        width: 120,
        height: "auto",
        minHeight: 72,
        border: `2px solid ${border}`,
        borderRadius: 12,
        background,
        boxShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    };
  });

  const edges: Edge[] = currentStep.searchTree
    .filter((treeNode) => treeNode.parentTreeId !== null)
    .map((treeNode) => {
      const isSolutionEdge =
        treeNode.status === "path"
        && treeById.get(treeNode.parentTreeId ?? "")?.status === "path";
      const isActiveEdge =
        activeBranchIds.has(treeNode.treeId)
        && activeBranchIds.has(treeNode.parentTreeId ?? "");

      return {
        id: `${treeNode.parentTreeId}-${treeNode.treeId}`,
        source: treeNode.parentTreeId ?? "",
        target: treeNode.treeId,
        type: "straight",
        animated: isActiveEdge,
        style: {
          stroke: isSolutionEdge
            ? "#22c55e"
            : isActiveEdge
              ? "#f59e0b"
              : "#475569",
          strokeWidth: isSolutionEdge ? 4 : isActiveEdge ? 3 : 2,
        },
      };
    });

  return (
    <div className="h-full min-h-[260px] overflow-hidden rounded-lg border border-slate-800 bg-[#090d16]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesFocusable={false}
        edgesFocusable={false}
        nodesConnectable={false}
        panOnDrag
        zoomOnScroll
        minZoom={0.25}
        maxZoom={1.8}
        className="bg-[#090d16]"
        aria-label="Search tree trace"
      >
        <Background color="#1e293b" gap={24} />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
