# AgriSmart Codebase Visualization

This document contains various diagrams representing the structure and relationships in the AgriSmart codebase.

## Architecture Overview

```mermaid
flowchart TD
    Client[Client/Frontend]
    API[API Layer]
    Services[Service Layer]
    DB[(Database)]
    
    Client --> API
    API --> Services
    Services --> DB
```

## Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +getProfile()
        +updateProfile()
    }
    
    class Farm {
        +String id
        +String name
        +String location
        +User owner
        +addCrop()
        +generateReport()
    }
    
    class Crop {
        +String id
        +String name
        +Date plantedDate
        +String status
        +updateStatus()
    }
    
    class SensorData {
        +String id
        +String sensorId
        +DateTime timestamp
        +float value
        +String metric
    }
    
    User "1" -- "*" Farm : owns
    Farm "1" -- "*" Crop : has
    Crop "1" -- "*" SensorData : generates
```

## Component Diagram

```mermaid
flowchart LR
    subgraph Frontend
        UI[User Interface]
        State[State Management]
        API_Client[API Client]
    end
    
    subgraph Backend
        Routes[API Routes]
        Controllers[Controllers]
        Services[Services]
        Models[Data Models]
    end
    
    subgraph Database
        DB[(Database)]
    end
    
    UI <--> State
    State <--> API_Client
    API_Client <--> Routes
    Routes <--> Controllers
    Controllers <--> Services
    Services <--> Models
    Models <--> DB
```

## Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant API
    participant Service
    participant Database
    
    User->>UI: Request farm data
    UI->>API: GET /farms/:id
    API->>Service: getFarmById(id)
    Service->>Database: query(farmId)
    Database-->>Service: farmData
    Service-->>API: farmData
    API-->>UI: JSON response
    UI-->>User: Display farm data
```

## Process Flow

```mermaid
stateDiagram-v2
    [*] --> Register
    Register --> Login
    Login --> Dashboard
    
    state Dashboard {
        [*] --> ViewFarms
        ViewFarms --> AddFarm
        ViewFarms --> SelectFarm
        SelectFarm --> ViewCrops
        ViewCrops --> AddCrop
        ViewCrops --> MonitorCrop
    }
    
    Dashboard --> Logout
    Logout --> [*]
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ FARM : owns
    FARM ||--o{ CROP : has
    CROP ||--o{ SENSOR : monitored_by
    SENSOR ||--o{ SENSOR_DATA : generates
    
    USER {
        string id PK
        string name
        string email
        string password_hash
    }
    
    FARM {
        string id PK
        string name
        string location
        string owner_id FK
        float area
    }
    
    CROP {
        string id PK
        string name
        string farm_id FK
        date planted_date
        string status
    }
    
    SENSOR {
        string id PK
        string type
        string crop_id FK
        string location
    }
    
    SENSOR_DATA {
        string id PK
        string sensor_id FK
        datetime timestamp
        float value
        string metric
    }
```

---

To customize these diagrams for your actual codebase:

1. Replace the placeholder classes, components, and entities with your actual code structures
2. Update the relationships to reflect your actual code dependencies
3. Add or remove diagrams as needed based on your project's complexity

You can render these diagrams in any Markdown viewer that supports Mermaid, such as GitHub, or using the Mermaid Live Editor at https://mermaid.live/
