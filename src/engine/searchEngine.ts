import type {
  AlgorithmType,
  ExecutionStep,
  GraphEdge,
  ScenarioDefinition,
  SearchTreeNode,
} from "../types/graph";

interface FrontierEntry {
  stateId: string;
  treeId: string;
  g: number;
  h: number;
  f: number;
  sequence: number;
  parentTreeId: string | null;
  activeEdgeId: string | null;
}

function getNeighbors(
  scenario: ScenarioDefinition,
  stateId: string,
): Array<{ nodeId: string; edge: GraphEdge }> {
  const neighbors: Array<{ nodeId: string; edge: GraphEdge }> = [];

  for (const edge of scenario.edges) {
    if (edge.blocked) continue;
    if (edge.source === stateId) {
      neighbors.push({ nodeId: edge.target, edge });
    } else if (edge.target === stateId) {
      neighbors.push({ nodeId: edge.source, edge });
    }
  }

  return neighbors;
}

export function generateExecutionSteps(
  scenario: ScenarioDefinition,
  algorithm: AlgorithmType,
): ExecutionStep[] {
  const nodeById = new Map(scenario.nodes.map((node) => [node.id, node]));
  const initialNode = nodeById.get(scenario.initialState);
  if (!initialNode) return [];

  let sequence = 0;
  let frontier: FrontierEntry[] = [{
    stateId: scenario.initialState,
    treeId: `${scenario.initialState}-${sequence}`,
    g: 0,
    h: initialNode.heuristic,
    f: initialNode.heuristic,
    sequence,
    parentTreeId: null,
    activeEdgeId: null,
  }];
  const entryByTreeId = new Map(frontier.map((entry) => [entry.treeId, entry]));
  const bestCost = new Map<string, number>([[scenario.initialState, 0]]);
  const exploredIds: string[] = [];
  const searchTree: SearchTreeNode[] = [{
    treeId: frontier[0].treeId,
    parentTreeId: null,
    stateId: scenario.initialState,
    depth: 0,
    pathCost: 0,
    heuristic: initialNode.heuristic,
    totalCost: initialNode.heuristic,
    status: "frontier",
  }];
  const steps: ExecutionStep[] = [];
  let stepIndex = 0;

  const snapshot = (
    current: FrontierEntry | null,
    actionLog: string,
    goalReached: boolean,
  ): void => {
    const frontierIds = new Set(frontier.map((entry) => entry.treeId));
    const pathIds = goalReached ? reconstructPath(frontierEntryForGoal(current), searchTree) : [];
    const pathTreeIds = new Set(pathIds.map((entry) => entry.treeId));
    const renderedTree: SearchTreeNode[] = searchTree.map((treeNode) => ({
      ...treeNode,
      status:
        pathTreeIds.has(treeNode.treeId)
          ? ("path" as const)
          : frontierIds.has(treeNode.treeId)
            ? ("frontier" as const)
            : exploredIds.includes(treeNode.stateId)
              ? ("explored" as const)
              : ("explored" as const),
    }));

    if (current) {
      const currentTreeNode = renderedTree.find((node) => node.treeId === current.treeId);
      if (currentTreeNode) currentTreeNode.status = goalReached ? "path" : "current";
    }

    const finalPath = goalReached
      ? reconstructStatePath(current, entryByTreeId)
      : [];

    steps.push({
      stepIndex,
      currentNodeId: current?.stateId ?? null,
      currentTreeId: current?.treeId ?? null,
      frontier: frontier.map((entry) => ({
        stateId: entry.stateId,
        treeId: entry.treeId,
        g: entry.g,
        h: entry.h,
        f: entry.f,
      })),
      exploredIds: [...exploredIds],
      activeEdgeId: current?.activeEdgeId ?? null,
      searchTree: renderedTree,
      actionLog,
      goalReached,
      finalPath,
      totalPathCost: goalReached ? (current?.g ?? 0) : 0,
    });
    stepIndex += 1;
  };

  snapshot(frontier[0], `Start exploration at ${scenario.initialState}.`, false);

  while (frontier.length > 0) {
    let currentIndex = 0;

    if (algorithm === "DFS") {
      currentIndex = frontier.length - 1;
    } else if (algorithm === "UCS" || algorithm === "ASTAR") {
      frontier.sort((a, b) =>
        algorithm === "ASTAR"
          ? (a.f - b.f || a.g - b.g || a.sequence - b.sequence)
          : (a.g - b.g || a.sequence - b.sequence),
      );
    }

    const current = frontier.splice(currentIndex, 1)[0];
    if (exploredIds.includes(current.stateId)) {
      continue;
    }

    exploredIds.push(current.stateId);
    const parentNode = searchTree.find((node) => node.treeId === current.treeId);
    if (parentNode) parentNode.status = "explored";

    const goalReached = current.stateId === scenario.goalState;
    snapshot(
      current,
      goalReached
        ? `Goal reached at ${current.stateId}.`
        : `Expanding ${current.stateId} (${algorithm}).`,
      goalReached,
    );

    if (goalReached) break;

    const neighbors = getNeighbors(scenario, current.stateId);
    for (const { nodeId, edge } of neighbors) {
      const node = nodeById.get(nodeId);
      if (!node) continue;

      const nextG = current.g + edge.cost;
      const previousBest = bestCost.get(nodeId);
      if (previousBest !== undefined && previousBest <= nextG) continue;

      bestCost.set(nodeId, nextG);
      sequence += 1;
      const depth = 1 + (searchTree.find((treeNode) =>
        treeNode.treeId === current.treeId)?.depth ?? 0);
      const entry: FrontierEntry = {
        stateId: nodeId,
        treeId: `${nodeId}-${sequence}`,
        g: nextG,
        h: node.heuristic,
        f: nextG + node.heuristic,
        sequence,
        parentTreeId: current.treeId,
        activeEdgeId: edge.id,
      };
      entryByTreeId.set(entry.treeId, entry);

      searchTree.push({
        treeId: entry.treeId,
        parentTreeId: current.treeId,
        stateId: nodeId,
        depth,
        pathCost: nextG,
        heuristic: node.heuristic,
        totalCost: nextG + node.heuristic,
        status: "frontier",
      });

      if (algorithm === "DFS") {
        frontier.push(entry);
      } else {
        frontier.push(entry);
      }
    }
  }

  return steps;
}

function frontierEntryForGoal(current: FrontierEntry | null): FrontierEntry | null {
  return current;
}

function reconstructPath(
  goalEntry: FrontierEntry | null,
  searchTree: SearchTreeNode[],
): Array<{ treeId: string }> {
  if (!goalEntry) return [];
  const treeById = new Map(searchTree.map((node) => [node.treeId, node]));
  const path: Array<{ treeId: string }> = [];
  let treeId: string | null = goalEntry.treeId;
  while (treeId) {
    path.unshift({ treeId });
    treeId = treeById.get(treeId)?.parentTreeId ?? null;
  }
  return path;
}

function reconstructStatePath(
  goalEntry: FrontierEntry | null,
  entryByTreeId: Map<string, FrontierEntry>,
): string[] {
  if (!goalEntry) return [];
  const path: string[] = [];
  let treeId: string | null = goalEntry.treeId;
  while (treeId) {
    const entry = entryByTreeId.get(treeId);
    if (!entry) break;
    path.unshift(entry.stateId);
    treeId = entry.parentTreeId;
  }
  return path;
}
