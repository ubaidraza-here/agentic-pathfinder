import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type EdgeMouseHandler,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {
  ExecutionStep,
  ScenarioDefinition,
} from "../../types/graph";

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
          <div className="text-center">
            <div className="text-sm font-bold">{node.id}</div>
            <div className="mt-1 max-w-32 text-[11px] leading-tight text-slate-950">
              {node.label}
            </div>
          </div>
        ),
      },
      style: {
        width: 112,
        height: 72,
        border: `2px solid ${border}`,
        borderRadius: 12,
        background,
        color: "#ffffff",
        boxShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    };
  });

  const edges: Edge[] = scenario.edges.map((edge) => {
    const sourceIndex = currentStep.finalPath.indexOf(edge.source);
    const targetIndex = currentStep.finalPath.indexOf(edge.target);
    const isFinalPath = currentStep.goalReached
      && sourceIndex >= 0
      && targetIndex >= 0
      && Math.abs(sourceIndex - targetIndex) === 1;
    const isActive = currentStep.activeEdgeId === edge.id;

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: String(edge.cost),
      type: "smoothstep",
      animated: isActive,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.blocked
          ? "#ef4444"
          : isFinalPath
            ? "#22c55e"
            : "#94a3b8",
      },
      style: {
        stroke: edge.blocked
          ? "#ef4444"
          : isFinalPath
            ? "#22c55e"
            : isActive
              ? "#f59e0b"
              : "#94a3b8",
        strokeWidth: isFinalPath ? 5 : isActive ? 4 : 2,
        strokeDasharray: edge.blocked ? "6 6" : undefined,
      },
      labelStyle: {
        fill: "#e2e8f0",
        fontWeight: 700,
        fontSize: 12,
      },
      labelBgStyle: {
        fill: "#0f172a",
        fillOpacity: 0.95,
      },
    };
  });

  const handleEdgeClick: EdgeMouseHandler = (_event, edge) => {
    onToggleEdgeBlock(edge.id);
  };

  const handleEdgeDoubleClick: EdgeMouseHandler = (_event, edge) => {
    const scenarioEdge = scenario.edges.find((item) => item.id === edge.id);
    if (!scenarioEdge) return;
    const input = window.prompt(
      `Enter a new positive cost for edge ${edge.id}`,
      String(scenarioEdge.cost),
    );
    if (input === null) return;
    const cost = Number(input);
    if (Number.isFinite(cost) && cost >= 1) {
      onUpdateEdgeCost(edge.id, cost);
    }
  };

  return (
    <div className="h-full min-h-[260px] overflow-hidden rounded-lg border border-slate-800 bg-[#090d16]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgeClick={handleEdgeClick}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        fitView
        fitViewOptions={{ padding: 0.18 }}
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
