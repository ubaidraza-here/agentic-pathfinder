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

function reconstructStatePath(
  goalEntry: FrontierEntry,
  entryByTreeId: Map<string, FrontierEntry>,
): string[] {
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

export function generateExecutionSteps(
  scenario: ScenarioDefinition,
  algorithm: AlgorithmType,
): ExecutionStep[] {
  const nodeById = new Map(
    scenario.nodes.map((node) => [node.id, node]),
  );
  const initialNode = nodeById.get(scenario.initialState);
  if (!initialNode) {
    return [{
      stepIndex: 0,
      currentNodeId: null,
      currentTreeId: null,
      frontier: [],
      exploredIds: [],
      activeEdgeId: null,
      searchTree: [],
      actionLog: `Cannot start: initial state ${scenario.initialState} is missing.`,
      goalReached: false,
      finalPath: [],
      totalPathCost: 0,
    }];
  }

  let sequence = 0;
  const initialTreeId = `${scenario.initialState}-${sequence}`;
  let frontier: FrontierEntry[] = [{
    stateId: scenario.initialState,
    treeId: initialTreeId,
    g: 0,
    h: initialNode.heuristic,
    f: initialNode.heuristic,
    sequence,
    parentTreeId: null,
    activeEdgeId: null,
  }];

  const entryByTreeId = new Map<string, FrontierEntry>([
    [initialTreeId, frontier[0]],
  ]);
  const bestCost = new Map<string, number>([
    [scenario.initialState, 0],
  ]);
  const exploredIds: string[] = [];
  const searchTree: SearchTreeNode[] = [{
    treeId: initialTreeId,
    parentTreeId: null,
    stateId: scenario.initialState,
    depth: 0,
    pathCost: 0,
    heuristic: initialNode.heuristic,
    totalCost: initialNode.heuristic,
    status: "frontier",
  }];
  const steps: ExecutionStep[] = [];
  let goalEntry: FrontierEntry | null = null;

  const snapshot = (
    current: FrontierEntry | null,
    actionLog: string,
  ): void => {
    const frontierTreeIds = new Set(
      frontier.map((entry) => entry.treeId),
    );
    const pathTreeIds = new Set<string>();

    if (goalEntry) {
      let treeId: string | null = goalEntry.treeId;
      while (treeId) {
        pathTreeIds.add(treeId);
        treeId = entryByTreeId.get(treeId)?.parentTreeId ?? null;
      }
    }

    const renderedTree: SearchTreeNode[] = searchTree.map((treeNode) => {
      let status: SearchTreeNode["status"];
      if (pathTreeIds.has(treeNode.treeId)) {
        status = "path";
      } else if (frontierTreeIds.has(treeNode.treeId)) {
        status = "frontier";
      } else if (exploredIds.includes(treeNode.stateId)) {
        status = "explored";
      } else {
        status = "explored";
      }

      if (current?.treeId === treeNode.treeId && !goalEntry) {
        status = "current";
      }
      return { ...treeNode, status };
    });

    const finalPath = goalEntry
      ? reconstructStatePath(goalEntry, entryByTreeId)
      : [];

    steps.push({
      stepIndex: steps.length,
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
      goalReached: goalEntry !== null,
      finalPath,
      totalPathCost: goalEntry?.g ?? 0,
    });
  };

  snapshot(null, `Start exploration at ${scenario.initialState}.`);

  while (frontier.length > 0) {
    let currentIndex = 0;

    if (algorithm === "DFS") {
      currentIndex = frontier.length - 1;
    } else if (algorithm === "UCS") {
      currentIndex = frontier.reduce(
        (bestIndex, entry, index) =>
          entry.g < frontier[bestIndex].g
          || (
            entry.g === frontier[bestIndex].g
            && entry.sequence < frontier[bestIndex].sequence
          )
            ? index
            : bestIndex,
        0,
      );
    } else if (algorithm === "ASTAR") {
      currentIndex = frontier.reduce(
        (bestIndex, entry, index) =>
          entry.f < frontier[bestIndex].f
          || (
            entry.f === frontier[bestIndex].f
            && entry.g > frontier[bestIndex].g
          )
          || (
            entry.f === frontier[bestIndex].f
            && entry.g === frontier[bestIndex].g
            && entry.sequence < frontier[bestIndex].sequence
          )
            ? index
            : bestIndex,
        0,
      );
    }

    const current = frontier.splice(currentIndex, 1)[0];
    const currentBestCost = bestCost.get(current.stateId);
    if (
      currentBestCost === undefined
      || currentBestCost !== current.g
    ) {
      continue;
    }

    if (!exploredIds.includes(current.stateId)) {
      exploredIds.push(current.stateId);
    }

    if (current.stateId === scenario.goalState) {
      goalEntry = current;
      snapshot(
        current,
        `Goal reached at ${current.stateId}.`,
      );
      break;
    }

    snapshot(
      current,
      `Expanding ${current.stateId} (${algorithm}).`,
    );

    for (const { nodeId, edge } of getNeighbors(scenario, current.stateId)) {
      const node = nodeById.get(nodeId);
      if (!node) continue;

      const nextG = current.g + edge.cost;
      const previousBest = bestCost.get(nodeId);
      if (previousBest !== undefined && previousBest <= nextG) {
        continue;
      }

      bestCost.set(nodeId, nextG);
      sequence += 1;
      const parentDepth =
        searchTree.find((treeNode) => treeNode.treeId === current.treeId)?.depth ?? 0;
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
        depth: parentDepth + 1,
        pathCost: nextG,
        heuristic: node.heuristic,
        totalCost: nextG + node.heuristic,
        status: "frontier",
      });
      frontier.push(entry);
    }
  }

  if (!goalEntry) {
    const reachableGoal = false;
    snapshot(
      null,
      reachableGoal
        ? `Search exhausted before reaching ${scenario.goalState}.`
        : `No open path reaches goal ${scenario.goalState}; frontier exhausted.`,
    );
  }

  return steps;
}
