# Call Flow and System Architecture

## 1. Runtime Overview

The application follows a unidirectional data flow:

```mermaid
flowchart TD
    U["User"] --> H["App Header"]
    U --> P["Playback Controls"]
    U --> G["GraphCanvas"]
    U --> M["Architecture Button"]

    H --> S["Scenario / Algorithm State"]
    S --> E["generateExecutionSteps(scenario, algorithm)"]
    E --> F["ExecutionStep[]"]
    P --> I["currentIndex / isPlaying / speedMs"]
    I --> F2["Current ExecutionStep"]
    F --> F2

    F2 --> GC["GraphCanvas"]
    F2 --> TC["SearchTreeCanvas"]
    F2 --> PI["ProblemInspector"]
    F2 --> PC["PlaybackControls"]

    G --> GT["Toggle Edge Blocked"]
    GT --> S2["Updated Scenario State"]
    S2 --> E

    M --> MOD["ArchitectureModal"]
```

## 2. Scenario and Algorithm Selection

```mermaid
sequenceDiagram
    actor User
    participant Header as App Header
    participant App as App State
    participant Engine as searchEngine.ts
    participant Graph as GraphCanvas
    participant Tree as SearchTreeCanvas
    participant Inspector as ProblemInspector
    participant Dock as PlaybackControls

    User->>Header: Select scenario
    Header->>App: setScenarioId(id)
    Header->>App: setScenario(SCENARIOS[id])
    App->>Engine: generateExecutionSteps(scenario, algorithm)
    Engine-->>App: ExecutionStep[]
    App->>App: Reset currentIndex and playback
    App->>Graph: currentStep
    App->>Tree: currentStep
    App->>Inspector: scenario + algorithm + currentStep
    App->>Dock: steps + currentIndex + playback state

    User->>Header: Select algorithm
    Header->>App: setAlgorithm(algorithm)
    App->>Engine: generateExecutionSteps(scenario, algorithm)
    Engine-->>App: Recomputed ExecutionStep[]
    App->>App: Reset playback position
    App->>Graph: Render selected frame
    App->>Tree: Render selected frame
    App->>Inspector: Render frontier and algorithm
```

## 3. Search Step Generation

```mermaid
sequenceDiagram
    participant App as App
    participant Engine as Search Engine
    participant Data as ScenarioDefinition
    participant Frame as ExecutionStep

    App->>Engine: generateExecutionSteps(scenario, algorithm)
    Engine->>Data: Read nodes and open edges
    Engine->>Engine: Initialize initial state
    Engine->>Engine: Create initial frontier entry
    Engine->>Frame: Emit initial snapshot

    loop Until frontier empty or goal reached
        Engine->>Engine: Select next entry by algorithm
        Engine->>Engine: Mark state explored
        Engine->>Engine: Record active node and edge
        Engine->>Engine: Generate successor entries
        Engine->>Engine: Update search tree and frontier
        Engine->>Frame: Emit expansion snapshot
        alt Goal state reached
            Engine->>Engine: Reconstruct final path
            Engine->>Frame: Emit goalReached frame
        end
    end

    Engine-->>App: ExecutionStep[]
```

## 4. Playback Call Flow

```mermaid
sequenceDiagram
    actor User
    participant Dock as PlaybackControls
    participant App as App State
    participant Graph as GraphCanvas
    participant Tree as SearchTreeCanvas
    participant Inspector as ProblemInspector

    User->>Dock: Play
    Dock->>App: onTogglePlay()
    App->>App: Start interval at speedMs
    loop Until final frame or Pause
        App->>App: Increment currentIndex
        App->>Graph: new currentStep
        App->>Tree: new currentStep
        App->>Inspector: new frontier/explored/action log
    end

    User->>Dock: Step Back / Step Forward
    Dock->>App: onStepChange(index)
    App->>App: Stop playback and update currentIndex
    App->>Graph: Selected frame
    App->>Tree: Selected frame
    App->>Inspector: Selected frame

    User->>Dock: Change speed
    Dock->>App: onSpeedChange(milliseconds)
    App->>App: Restart interval with new speed

    User->>Dock: Reset
    Dock->>App: onReset()
    App->>App: Stop playback and set index to zero
```

## 5. Graph Interaction Call Flow

```mermaid
sequenceDiagram
    actor User
    participant Graph as GraphCanvas
    participant App as App State
    participant Engine as searchEngine.ts

    User->>Graph: Click graph edge
    Graph->>App: onToggleEdgeBlock(edgeId)
    App->>App: Toggle blocked state
    App->>Engine: generateExecutionSteps(updated scenario, algorithm)
    Engine-->>App: New ExecutionStep[]
    App->>Graph: Render blocked/dynamic edge state
```

## 6. Architecture Modal Call Flow

```mermaid
sequenceDiagram
    actor User
    participant App as App
    participant Modal as ArchitectureModal
    participant Mermaid as Mermaid Renderer

    User->>App: Click Architecture & Formal Model
    App->>Modal: isOpen=true
    Modal->>Mermaid: Render selected tab diagram
    Mermaid-->>Modal: SVG diagram
    User->>Modal: Switch tab
    Modal->>Mermaid: Render requested formal/model diagram
    User->>Modal: Close
    Modal->>App: onClose()
    App->>Modal: isOpen=false
```
