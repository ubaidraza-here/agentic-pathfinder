import type { ScenarioDefinition } from "../types/graph";

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: "campus",
    title: "Smart Campus Navigation",
    problemDescription:
      "Navigate an autonomous campus agent from the Main Gate to the Computer Science Department.",
    agentObjective:
      "Find a valid route from the initial state A to the goal state D.",
    desiredOutcome:
      "Reach the Computer Science Department while minimizing or tracing the selected search path.",
    initialState: "A",
    goalState: "D",
    actionsDescription:
      "Move from one campus location to an adjacent location through an open corridor.",
    transitionModelDescription:
      "Each undirected edge allows travel in either direction at the displayed unit cost.",
    nodes: [
      { id: "A", label: "Main Gate", category: "Initial", x: 80, y: 300, heuristic: 6 },
      { id: "B", label: "Administration Block", category: "Intermediate", x: 260, y: 180, heuristic: 4 },
      { id: "C", label: "Library", category: "Intermediate", x: 260, y: 420, heuristic: 9 },
      { id: "D", label: "Computer Science Department", category: "Goal", x: 520, y: 300, heuristic: 0 },
      { id: "E", label: "Cafeteria", category: "Intermediate", x: 430, y: 180, heuristic: 7 },
      { id: "F", label: "Electrical Engineering Department", category: "Intermediate", x: 430, y: 520, heuristic: 6 },
      { id: "G", label: "Computer Lab", category: "Intermediate", x: 620, y: 420, heuristic: 2 },
      { id: "H", label: "Auditorium", category: "Intermediate", x: 620, y: 180, heuristic: 4 },
    ],
    edges: [
      { id: "A-B", source: "A", target: "B", cost: 2 },
      { id: "A-C", source: "A", target: "C", cost: 3 },
      { id: "B-D", source: "B", target: "D", cost: 4 },
      { id: "B-E", source: "B", target: "E", cost: 2 },
      { id: "C-F", source: "C", target: "F", cost: 3 },
      { id: "C-H", source: "C", target: "H", cost: 5 },
      { id: "D-G", source: "D", target: "G", cost: 2 },
      { id: "E-H", source: "E", target: "H", cost: 3 },
      { id: "F-G", source: "F", target: "G", cost: 4 },
      { id: "G-H", source: "G", target: "H", cost: 2 },
    ],
  },
  {
    id: "hospital",
    title: "Hospital Emergency Navigation",
    problemDescription:
      "Route an emergency response agent from the Emergency Entrance to the Intensive Care Unit.",
    agentObjective:
      "Reach the ICU safely by navigating open hospital corridors.",
    desiredOutcome:
      "Find and inspect a route to the Intensive Care Unit.",
    initialState: "A",
    goalState: "G",
    actionsDescription:
      "Move between connected hospital departments through an open corridor.",
    transitionModelDescription:
      "Each undirected edge represents a bidirectional route with an associated travel cost.",
    nodes: [
      { id: "A", label: "Emergency Entrance", category: "Initial", x: 80, y: 360, heuristic: 9 },
      { id: "B", label: "Reception", category: "Intermediate", x: 260, y: 220, heuristic: 8 },
      { id: "C", label: "General Ward", category: "Intermediate", x: 260, y: 500, heuristic: 7 },
      { id: "D", label: "Diagnostic Laboratory", category: "Intermediate", x: 440, y: 120, heuristic: 5 },
      { id: "E", label: "Pharmacy", category: "Intermediate", x: 440, y: 500, heuristic: 7 },
      { id: "F", label: "Operation Theatre", category: "Intermediate", x: 620, y: 500, heuristic: 3 },
      { id: "G", label: "Intensive Care Unit (ICU)", category: "Goal", x: 800, y: 360, heuristic: 0 },
      { id: "H", label: "Radiology Department", category: "Intermediate", x: 620, y: 120, heuristic: 2 },
      { id: "I", label: "Patient Waiting Area", category: "Intermediate", x: 440, y: 220, heuristic: 5 },
    ],
    edges: [
      { id: "A-B", source: "A", target: "B", cost: 2 },
      { id: "A-C", source: "A", target: "C", cost: 2 },
      { id: "B-D", source: "B", target: "D", cost: 3 },
      { id: "B-I", source: "B", target: "I", cost: 2 },
      { id: "C-E", source: "C", target: "E", cost: 2 },
      { id: "C-F", source: "C", target: "F", cost: 4 },
      { id: "D-H", source: "D", target: "H", cost: 3 },
      { id: "E-I", source: "E", target: "I", cost: 2 },
      { id: "F-G", source: "F", target: "G", cost: 3 },
      { id: "G-H", source: "G", target: "H", cost: 2 },
      { id: "H-I", source: "H", target: "I", cost: 3 },
    ],
  },
  {
    id: "city",
    title: "Smart City Traffic Navigation",
    problemDescription:
      "Navigate a city response agent from the Police Station to City Hospital.",
    agentObjective:
      "Find an open-route path to the City Hospital.",
    desiredOutcome:
      "Reach City Hospital while accounting for congestion costs and blocked roads.",
    initialState: "A",
    goalState: "F",
    actionsDescription:
      "Move from one city location to an adjacent location over an open road.",
    transitionModelDescription:
      "Road edges are undirected and weighted by travel cost.",
    nodes: [
      { id: "A", label: "Police Station", category: "Initial", x: 80, y: 350, heuristic: 9 },
      { id: "B", label: "City Mall", category: "Intermediate", x: 260, y: 220, heuristic: 8 },
      { id: "C", label: "Central Park", category: "Intermediate", x: 260, y: 480, heuristic: 7 },
      { id: "D", label: "Fire Station", category: "Intermediate", x: 440, y: 220, heuristic: 5 },
      { id: "E", label: "University", category: "Intermediate", x: 440, y: 480, heuristic: 5 },
      { id: "F", label: "City Hospital", category: "Goal", x: 800, y: 350, heuristic: 0 },
      { id: "G", label: "Railway Station", category: "Intermediate", x: 440, y: 100, heuristic: 10 },
      { id: "H", label: "Airport", category: "Intermediate", x: 620, y: 100, heuristic: 7 },
      { id: "I", label: "Bus Terminal", category: "Intermediate", x: 620, y: 480, heuristic: 4 },
      { id: "J", label: "Government Office", category: "Intermediate", x: 620, y: 220, heuristic: 3 },
    ],
    edges: [
      { id: "A-B", source: "A", target: "B", cost: 3 },
      { id: "A-C", source: "A", target: "C", cost: 2 },
      { id: "B-D", source: "B", target: "D", cost: 4 },
      { id: "B-E", source: "B", target: "E", cost: 3 },
      { id: "C-G", source: "C", target: "G", cost: 4 },
      { id: "C-I", source: "C", target: "I", cost: 3 },
      { id: "D-F", source: "D", target: "F", cost: 5 },
      { id: "E-J", source: "E", target: "J", cost: 2 },
      { id: "F-I", source: "F", target: "I", cost: 4 },
      { id: "F-J", source: "F", target: "J", cost: 3 },
      { id: "G-H", source: "G", target: "H", cost: 3 },
      { id: "H-J", source: "H", target: "J", cost: 4 },
    ],
  },
];
