import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  getStraightPath,
  type Edge,
  type EdgeMouseHandler,
  type EdgeProps,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {
  ExecutionStep,
  ScenarioDefinition,
} from "../../types/graph";

interface CostEdgeData extends Record<string, unknown> {
  cost: number;
  labelPosition: number;
}

function CostEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style,
}: EdgeProps<Edge<CostEdgeData>>) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const cost = typeof data?.cost === "number" ? data.cost : 0;
  const labelPosition = data?.labelPosition ?? 0.5;
  const labelX = sourceX + (targetX - sourceX) * labelPosition;
  const labelY = sourceY + (targetY - sourceY) * labelPosition;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        interactionWidth={24}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute z-10 rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-xs font-mono text-amber-300"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "none",
          }}
        >
          {cost}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = {
  cost: CostEdge,
};

export function GraphCanvas({
  scenario,
  currentStep,
  onToggleEdgeBlock,
  onUpdateEdgeCost,
}: {
  scenario: ScenarioDefinition;
  currentStep: ExecutionStep;
  onToggleEdgeBlock: (edgeId: string) => void;
  onUpdateEdgeCost: (edgeId: string, cost: number) => void;
}) {
  const frontierIds = new Set(
    currentStep.frontier.map((entry) => entry.stateId),
  );
  const exploredIds = new Set(currentStep.exploredIds);
  const finalPathIds = new Set(currentStep.finalPath);

  const nodes: Node[] = scenario.nodes.map((node) => {
    let background = "#1e293b";
    let border = "#64748b";
    let boxShadow: string | undefined;

    if (node.category === "Initial") {
      background = "#10b981";
      border = "#6ee7b7";
    } else if (node.category === "Goal") {
      background = "#f43f5e";
      border = "#fda4af";
    }

    if (frontierIds.has(node.id)) {
      background = "#38bdf8";
      border = "#7dd3fc";
    }

    if (exploredIds.has(node.id)) {
      background = "#475569";
      border = "#94a3b8";
    }

    if (finalPathIds.has(node.id)) {
      background = "#22c55e";
      border = "#86efac";
    }

    if (currentStep.currentNodeId === node.id) {
      background = "#f59e0b";
      border = "#fde68a";
      boxShadow = "0 0 18px 5px rgba(245, 158, 11, 0.75)";
    }

    return {
      id: node.id,
      position: { x: node.x, y: node.y },
      data: {
        label: (
          <div className="relative flex min-w-[130px] items-center gap-2 px-3 py-2">
            <Handle
              type="target"
              position={Position.Left}
              id="left"
              className="!opacity-0 !w-1 !h-1 !pointer-events-none !border-0 !bg-slate-500"
            />
            <Handle
              type="source"
              position={Position.Right}
              id="right"
              className="!opacity-0 !w-1 !h-1 !pointer-events-none !border-0 !bg-slate-500"
            />
            <Handle
              type="source"
              position={Position.Left}
              id="left"
              className="!opacity-0 !w-1 !h-1 !pointer-events-none !border-0 !bg-slate-500"
            />
            <Handle
              type="target"
              position={Position.Right}
              id="right"
              className="!opacity-0 !w-1 !h-1 !pointer-events-none !border-0 !bg-slate-500"
            />
            <Handle
              type="target"
              position={Position.Top}
              id="top"
              className="!opacity-0 !w-1 !h-1 !pointer-events-none !border-0 !bg-slate-500"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id="bottom"
              className="!opacity-0 !w-1 !h-1 !pointer-events-none !border-0 !bg-slate-500"
            />
            <Handle
              type="source"
              position={Position.Top}
              id="top"
              className="!opacity-0 !w-1 !h-1 !pointer-events-none !border-0 !bg-slate-500"
            />
            <Handle
              type="target"
              position={Position.Bottom}
              id="bottom"
              className="!opacity-0 !w-1 !h-1 !pointer-events-none !border-0 !bg-slate-500"
            />
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-sm font-bold text-white">
              {node.id}
            </div>
            <div className="max-w-24 text-left text-xs text-slate-200">
              {node.label}
            </div>
          </div>
        ),
      },
      style: {
        width: "auto",
        minWidth: 130,
        height: "auto",
        minHeight: 56,
        border: `2px solid ${border}`,
        borderRadius: 14,
        background,
        color: "#ffffff",
        boxShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    };
  });

  const edges: Edge[] = scenario.edges.map((edge, index) => {
    const sourceIndex = currentStep.finalPath.indexOf(edge.source);
    const targetIndex = currentStep.finalPath.indexOf(edge.target);
    const isFinalPath = currentStep.goalReached
      && sourceIndex >= 0
      && targetIndex >= 0
      && Math.abs(sourceIndex - targetIndex) === 1;
    const sourceNode = scenario.nodes.find((node) => node.id === edge.source);
    const targetNode = scenario.nodes.find((node) => node.id === edge.target);

    let sourceHandle = "right";
    let targetHandle = "left";
    if (sourceNode && targetNode) {
      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        sourceHandle = dx >= 0 ? "right" : "left";
        targetHandle = dx >= 0 ? "left" : "right";
      } else {
        sourceHandle = dy >= 0 ? "bottom" : "top";
        targetHandle = dy >= 0 ? "top" : "bottom";
      }
    }

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle,
      targetHandle,
      type: "cost",
      data: {
        cost: edge.cost,
        labelPosition: index % 2 === 0 ? 0.62 : 0.38,
      },
      animated: false,
      style: {
        stroke: edge.blocked
          ? "#ef4444"
          : isFinalPath
            ? "#22c55e"
            : "#94a3b8",
        strokeWidth: isFinalPath ? 4 : 2,
        strokeDasharray: edge.blocked ? "6 6" : undefined,
        filter: isFinalPath
          ? "drop-shadow(0 0 5px rgba(34,197,94,0.85))"
          : undefined,
      },
    };
  });

  const handleEdgeClick: EdgeMouseHandler = (_event, edge) => {
    onToggleEdgeBlock(edge.id);
  };

  const handleEdgeDoubleClick: EdgeMouseHandler = (_event, edge) => {
    const currentEdge = scenario.edges.find((item) => item.id === edge.id);
    if (!currentEdge) return;
    const result = window.prompt(
      `Enter a new cost for edge ${edge.id}`,
      String(currentEdge.cost),
    );
    if (result === null) return;
    const cost = Number(result);
    if (Number.isFinite(cost) && cost >= 1) {
      onUpdateEdgeCost(edge.id, cost);
    }
  };

  return (
    <div className="relative h-full min-h-[260px] overflow-hidden rounded-lg border border-slate-800 bg-[#090d16]">
      <div className="absolute left-3 top-3 z-10 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300 shadow-lg">
        Click edge to block/unblock · Double-click edge to edit cost
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgeClick={handleEdgeClick}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesFocusable={false}
        edgesFocusable
        nodesConnectable={false}
        panOnDrag
        zoomOnScroll
        minZoom={0.35}
        maxZoom={1.8}
        className="bg-[#090d16]"
        aria-label="Interactive state-space knowledge graph"
      >
        <Background color="#1e293b" gap={24} />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
