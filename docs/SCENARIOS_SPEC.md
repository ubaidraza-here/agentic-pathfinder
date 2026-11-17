# Lab Assignment Scenarios Specification (Ground Truth)

All 3 scenarios are modeled as undirected weighted graphs (`cost` >= 1) with admissible heuristics `h(n)` toward the Goal State[cite: 1, 3, 5, 7, 8].

## Scenario 1: Smart Campus Navigation (`id: 'campus'`)

- **Initial State:** `A` (Main Gate)[cite: 1]
- **Goal State:** `D` (Computer Science Department)[cite: 1]
- **Nodes:**[cite: 1]
  - `A`: Main Gate (Initial)
  - `B`: Administration Block (Intermediate)
  - `C`: Library (Intermediate)
  - `D`: Computer Science Department (Goal)
  - `E`: Cafeteria (Intermediate)
  - `F`: Electrical Engineering Department (Intermediate)
  - `G`: Computer Lab (Intermediate)
  - `H`: Auditorium (Intermediate)
- **Undirected Edges (from Lab `campus_graph`):**[cite: 1, 2]
  - `A-B` (cost: 2), `A-C` (cost: 3), `B-D` (cost: 4), `B-E` (cost: 2), `C-F` (cost: 3), `C-H` (cost: 5), `D-G` (cost: 2), `E-H` (cost: 3), `F-G` (cost: 4), `G-H` (cost: 2)

## Scenario 2: Hospital Emergency Navigation (`id: 'hospital'`)

- **Initial State:** `A` (Emergency Entrance)[cite: 3]
- **Goal State:** `G` (Intensive Care Unit (ICU))[cite: 3]
- **Nodes:**[cite: 3]
  - `A`: Emergency Entrance (Initial)
  - `B`: Reception (Intermediate)
  - `C`: General Ward (Intermediate)
  - `D`: Diagnostic Laboratory (Intermediate)
  - `E`: Pharmacy (Intermediate)
  - `F`: Operation Theatre (Intermediate)
  - `G`: Intensive Care Unit (ICU) (Goal)
  - `H`: Radiology Department (Intermediate)
  - `I`: Patient Waiting Area (Intermediate)
- **Undirected Edges (from Lab `hospital_graph`):**[cite: 3, 4]
  - `A-B` (cost: 2), `A-C` (cost: 2), `B-D` (cost: 3), `B-I` (cost: 2), `C-E` (cost: 2), `C-F` (cost: 4), `D-H` (cost: 3), `E-I` (cost: 2), `F-G` (cost: 3), `G-H` (cost: 2), `H-I` (cost: 3)

## Scenario 3: Smart City Traffic Navigation (`id: 'city'`)

- **Initial State:** `A` (Police Station)[cite: 5]
- **Goal State:** `F` (City Hospital)[cite: 5]
- **Nodes:**[cite: 5]
  - `A`: Police Station (Initial)
  - `B`: City Mall (Intermediate)
  - `C`: Central Park (Intermediate)
  - `D`: Fire Station (Intermediate)
  - `E`: University (Intermediate)
  - `F`: City Hospital (Goal)
  - `G`: Railway Station (Intermediate)
  - `H`: Airport (Intermediate)
  - `I`: Bus Terminal (Intermediate)
  - `J`: Government Office (Intermediate)
- **Undirected Edges (from Lab `city_graph`):**[cite: 5, 6]
  - `A-B` (cost: 3), `A-C` (cost: 2), `B-D` (cost: 4), `B-E` (cost: 3), `C-G` (cost: 4), `C-I` (cost: 3), `D-F` (cost: 5), `E-J` (cost: 2), `F-I` (cost: 4), `F-J` (cost: 3), `G-H` (cost: 3), `H-J` (cost: 4)
