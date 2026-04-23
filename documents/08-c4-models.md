# Chapter 8 — C4 Model Diagrams

The **C4 model** (Context, Container, Component, Code) provides a hierarchical way to describe software architecture at different zoom levels.

---

## 8.1 Level 1 — System Context Diagram

Shows the EMS and its relationship with external actors.

```mermaid
graph TB
    Admin((Admin User))
    Employee((Employee User))

    EMS["Employee Management System<br><i>Web Application</i><br>Manages employees, leaves,<br>departments, announcements"]

    Admin -->|"Manages employees,<br>approves leaves,<br>views reports"| EMS
    Employee -->|"Views profile, applies leave,<br>sets presence status"| EMS
    EMS -->|"Sends real-time<br>notifications"| Admin
    EMS -->|"Sends real-time<br>notifications"| Employee

    style EMS fill:#438DD5,color:#fff,stroke:#2E6DA4
    style Admin fill:#08427B,color:#fff
    style Employee fill:#08427B,color:#fff
```

---

## 8.2 Level 2 — Container Diagram

Zooms into the EMS to show the major containers (deployable units).

```mermaid
graph TB
    subgraph "EMS System Boundary"
        FE["<b>Frontend Container</b><br><i>React 19 SPA</i><br>Nginx 1.25<br>Port 3000"]
        BE["<b>Backend Container</b><br><i>Laravel 13 API</i><br>PHP 8.3<br>Port 8000"]
        WS["<b>WebSocket Server</b><br><i>Laravel Reverb</i><br>Port 8080"]
        QW["<b>Queue Worker</b><br><i>Supervisor-managed</i><br>Background jobs"]
        DB[("<b>MySQL 8.0</b><br><i>Database</i><br>Port 3306")]
    end

    User((User / Browser))

    User -->|"HTTPS requests"| FE
    User -->|"WebSocket (ws://)"| WS
    FE -->|"REST API calls<br>(JSON)"| BE
    BE -->|"SQL queries<br>(Eloquent ORM)"| DB
    BE -->|"Dispatch jobs"| QW
    QW -->|"Process jobs"| DB
    WS -->|"Read/write<br>presence data"| DB
    WS -->|"Broadcast events"| User

    style FE fill:#438DD5,color:#fff
    style BE fill:#438DD5,color:#fff
    style WS fill:#438DD5,color:#fff
    style QW fill:#438DD5,color:#fff
    style DB fill:#B3B3B3,color:#000
```

---

## 8.3 Level 3 — Component Diagram (Backend)

Zooms into the Laravel Backend container to show internal modules.

```mermaid
graph TB
    subgraph "Laravel Backend Container"
        SANC["<b>Sanctum Middleware</b><br>Token Authentication"]

        subgraph "Modules"
            AUTH["Auth Module<br><i>Login, Register,<br>Logout</i>"]
            USR["User Module<br><i>Employee CRUD,<br>Profile</i>"]
            DEPT["Department Module<br><i>Department CRUD</i>"]
            LV["Leave Module<br><i>Apply, Approve,<br>Reject</i>"]
            ANN["Announcement Module<br><i>Publish, List,<br>Delete</i>"]
            PRES["Presence Module<br><i>Status Tracking</i>"]
            NOTIF["Notification Module<br><i>Bell, Mark Read</i>"]
            DASH["Dashboard Module<br><i>Stats, Charts,<br>Reports</i>"]
            SET["Setting Module<br><i>Feature Flags</i>"]
            BKP["Backup Module<br><i>DB Backup,<br>Download</i>"]
        end

        ELOQUENT["<b>Eloquent ORM</b><br>Model Layer"]
    end

    API_REQ[API Request] --> SANC
    SANC --> AUTH
    SANC --> USR
    SANC --> DEPT
    SANC --> LV
    SANC --> ANN
    SANC --> PRES
    SANC --> NOTIF
    SANC --> DASH
    SANC --> SET
    SANC --> BKP

    USR --> ELOQUENT
    DEPT --> ELOQUENT
    LV --> ELOQUENT
    ANN --> ELOQUENT
    PRES --> ELOQUENT
    NOTIF --> ELOQUENT
    DASH --> ELOQUENT
    BKP --> ELOQUENT

    ELOQUENT --> DB[(MySQL)]

    style SANC fill:#FF6B6B,color:#fff
    style ELOQUENT fill:#51CF66,color:#fff
```

---

## 8.4 Level 3 — Component Diagram (Frontend)

Zooms into the React Frontend container.

```mermaid
graph TB
    subgraph "React Frontend Container"
        ROUTER["<b>React Router v6</b><br>Client-side routing"]

        subgraph "Shared Layer"
            AXIOS_INT["Axios Instance<br>+ Interceptors"]
            GUARDS["ProtectedRoute<br>+ RoleGuard"]
            LAYOUT["AppLayout<br>Sidebar, Navbar"]
            TOAST["Toast System<br>Global notifications"]
        end

        subgraph "Module Pages"
            P1["LoginPage"]
            P2["DashboardPage"]
            P3["EmployeeListPage<br>+ ProfilePage"]
            P4["DepartmentListPage"]
            P5["LeaveListPage<br>+ ApplyLeavePage"]
            P6["AnnouncementsPage"]
            P7["SettingsPage"]
            P8["BackupPage"]
        end

        subgraph "Stores (Zustand)"
            ST1["authStore<br><i>token, user</i>"]
            ST2["toastStore<br><i>toast queue</i>"]
            ST3["settingsStore<br><i>feature flags</i>"]
        end
    end

    ROUTER --> GUARDS
    GUARDS --> LAYOUT
    LAYOUT --> P2
    LAYOUT --> P3
    LAYOUT --> P4
    LAYOUT --> P5
    LAYOUT --> P6
    P1 --> ST1
    P2 --> AXIOS_INT
    P3 --> AXIOS_INT
    AXIOS_INT -->|"HTTP + Bearer Token"| BACKEND[Laravel API]

    style ROUTER fill:#61DAFB,color:#000
    style AXIOS_INT fill:#FF6B6B,color:#fff
```

---

## 8.5 Level 4 — Code Diagram (Leave Module Example)

Zooms into a single module to show classes and their relationships.

```mermaid
classDiagram
    class LeaveController {
        +index() JsonResponse
        +store(StoreLeaveRequest) JsonResponse
        +approve(Leave) JsonResponse
        +reject(Leave) JsonResponse
        +destroy(Leave) JsonResponse
    }

    class Leave {
        +id: int
        +user_id: int
        +type: enum
        +start_date: date
        +end_date: date
        +status: enum
        +reason: text
        +approved_by: int
        +user() BelongsTo
        +approver() BelongsTo
    }

    class StoreLeaveRequest {
        +rules() array
        +authorize() bool
    }

    class LeaveResource {
        +toArray() array
    }

    LeaveController --> Leave : queries
    LeaveController --> StoreLeaveRequest : validates
    LeaveController --> LeaveResource : transforms
    Leave --> User : belongsTo
```
