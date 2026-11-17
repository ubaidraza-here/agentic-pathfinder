export type AlgorithmType = "BFS" | "DFS" | "UCS" | "ASTAR";

export type NodeCategory = "Initial" | "Intermediate" | "Goal";

export interface GraphNode {
  id: string;
  label: string;
  category: NodeCategory;
  x: number; // Canvas X coordinate for clean initial layout
  y: number; // Canvas Y coordinate for clean initial layout
  heuristic: number; // Estimated cost h(n) to Goal for A*
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  cost: number; // Edge weight g(n)
  blocked?: boolean; // Supports dynamic road/corridor closure
}

export interface ScenarioDefinition {
  id: "campus" | "hospital" | "city";
  title: string;
  problemDescription: string;
  agentObjective: string;
  desiredOutcome: string;
  initialState: string;
  goalState: string;
  actionsDescription: string;
  transitionModelDescription: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SearchTreeNode {
  treeId: string; // Unique ID in search tree (e.g., "A-0", "B-1")
  parentTreeId: string | null;
  stateId: string; // Graph node ID (e.g., "A", "B")
  depth: number;
  pathCost: number; // g(n)
  heuristic: number; // h(n)
  totalCost: number; // f(n) = g(n) + h(n)
  status: "frontier" | "current" | "explored" | "path";
}

export interface ExecutionStep {
  stepIndex: number;
  currentNodeId: string | null;
  currentTreeId: string | null;
  frontier: Array<{
    stateId: string;
    treeId: string;
    g: number;
    h: number;
    f: number;
  }>;
  exploredIds: string[];
  activeEdgeId: string | null;
  searchTree: SearchTreeNode[];
  actionLog: string; // Human-readable transition step
  goalReached: boolean;
  finalPath: string[]; // Ordered node IDs from Initial to Goal
  totalPathCost: number;
}
