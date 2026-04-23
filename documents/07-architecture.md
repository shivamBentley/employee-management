# Chapter 7 — System Architecture

## 7.1 High-Level Architecture

The EMS follows a **3-tier architecture** with clear separation:

| Tier            | Technology               | Responsibility                        |
| --------------- | ------------------------ | ------------------------------------- |
| Presentation    | React 19 SPA + Nginx     | User interface, routing, state        |
| Application     | Laravel 13 API           | Business logic, auth, REST endpoints  |
| Data            | MySQL 8.0                | Persistent storage, relational data   |

Additionally, **Laravel Reverb** provides a WebSocket layer for real-time features.

## 7.2 Architecture Diagram

```mermaid
graph TB
    subgraph "Client Browser"
        SPA[React 19 SPA<br>Tailwind CSS + Zustand]
    end

    subgraph "Docker Network"
        subgraph "Frontend Container"
            NGINX[Nginx 1.25<br>Static File Server<br>Port 3000]
        end

        subgraph "Backend Container"
            API[Laravel 13 API<br>Port 8000]
            QUEUE[Queue Worker<br>Database Driver]
            WS[Laravel Reverb<br>WebSocket Server<br>Port 8080]
        end

        subgraph "Database Container"
            DB[(MySQL 8.0<br>Port 3306)]
        end
    end

    SPA -->|HTTP REST API| NGINX
    NGINX -->|Proxy /api/*| API
    SPA -->|WebSocket| WS
    API <-->|Eloquent ORM| DB
    QUEUE <-->|Jobs| DB
    WS <-->|Broadcasting| DB
    API -->|Dispatch jobs| QUEUE
```

## 7.3 Request–Response Flow

```mermaid
sequenceDiagram
    participant B as Browser (React)
    participant N as Nginx
    participant L as Laravel API
    participant D as MySQL
    participant R as Reverb (WS)

    B->>N: GET /api/users (Bearer token)
    N->>L: Forward request
    L->>L: Authenticate via Sanctum
    L->>D: SELECT * FROM users
    D-->>L: Result set
    L-->>N: JSON response
    N-->>B: HTTP 200 + JSON

    Note over B,R: Real-time presence update
    B->>R: WebSocket: status = "online"
    R->>D: UPDATE presence SET status = 'online'
    R-->>B: Broadcast to all clients
```

## 7.4 Backend Module Architecture

The Laravel backend uses a **modular monolith** pattern. Instead of a single `app/Http/Controllers/` directory, each domain feature is self-contained:

```
app/Modules/
├── Auth/           → Login, register, logout
├── User/           → Employee CRUD, profile
├── Department/     → Department CRUD
├── Leave/          → Leave application + approval
├── Announcement/   → Publish + list announcements
├── Presence/       → Status tracking (WebSocket)
├── Notification/   → In-app notification system
├── Dashboard/      → Stats, charts, reports
├── Setting/        → Feature flags
├── Backup/         → Database backup management
└── Demo/           → Sample data seeding/reset
```

Each module contains:

```
Module/
├── Controllers/    → HTTP request handlers
├── Models/         → Eloquent models
├── Resources/      → API resource transformers
├── Requests/       → Form request validation
├── Policies/       → Authorization policies
└── routes.php      → Module-specific route definitions
```

## 7.5 Frontend Architecture

```mermaid
graph TB
    subgraph "React Application"
        ROUTER[React Router v6<br>Route definitions]
        ROUTER --> LAYOUT[AppLayout<br>Sidebar + Navbar + Breadcrumb]
        LAYOUT --> PAGES[Page Components]

        subgraph "Modules"
            M1[auth/]
            M2[dashboard/]
            M3[employees/]
            M4[departments/]
            M5[leaves/]
            M6[announcements/]
            M7[settings/]
            M8[backup/]
            M9[presence/]
            M10[notifications/]
        end

        PAGES --> M1
        PAGES --> M2
        PAGES --> M3
        PAGES --> M4
        PAGES --> M5

        subgraph "State Management"
            S1[authStore<br>Zustand + persist]
            S2[toastStore<br>Zustand]
            S3[settingsStore<br>Zustand]
        end

        subgraph "Shared"
            AXIOS[Axios Instance<br>Interceptors]
            COMPONENTS[Shared Components<br>Layout, Guards, Toast]
        end
    end
```

## 7.6 API Design Pattern

All API endpoints follow **RESTful conventions**:

| Method | Endpoint                      | Description              | Auth    |
| ------ | ----------------------------- | ------------------------ | ------- |
| POST   | `/api/login`                  | Authenticate user        | Public  |
| POST   | `/api/register`               | Register new account     | Public  |
| POST   | `/api/logout`                 | Revoke token             | Token   |
| GET    | `/api/me`                     | Current user profile     | Token   |
| POST   | `/api/me`                     | Update own profile       | Token   |
| GET    | `/api/users`                  | List all employees       | Admin   |
| POST   | `/api/users`                  | Create employee          | Admin   |
| GET    | `/api/users/{id}`             | Get employee detail      | Admin   |
| PUT    | `/api/users/{id}`             | Update employee          | Admin   |
| DELETE | `/api/users/{id}`             | Delete employee          | Admin   |
| GET    | `/api/departments`            | List departments         | Token   |
| POST   | `/api/departments`            | Create department        | Admin   |
| PUT    | `/api/departments/{id}`       | Update department        | Admin   |
| DELETE | `/api/departments/{id}`       | Delete department        | Admin   |
| GET    | `/api/leaves`                 | List leaves              | Token   |
| POST   | `/api/leaves`                 | Apply for leave          | Token   |
| POST   | `/api/leaves/{id}/approve`    | Approve leave            | Admin   |
| POST   | `/api/leaves/{id}/reject`     | Reject leave             | Admin   |
| DELETE | `/api/leaves/{id}`            | Cancel leave             | Owner   |
| GET    | `/api/announcements`          | List announcements       | Token   |
| POST   | `/api/announcements`          | Create announcement      | Admin   |
| DELETE | `/api/announcements/{id}`     | Delete announcement      | Admin   |
| GET    | `/api/notifications`          | List notifications       | Token   |
| POST   | `/api/notifications/{id}/read`| Mark as read             | Token   |
| POST   | `/api/presence`               | Update presence status   | Token   |
| GET    | `/api/settings`               | Get settings             | Admin   |
| PUT    | `/api/settings`               | Update settings          | Admin   |
| GET    | `/api/backups`                | List backups             | Admin   |
| POST   | `/api/backups`                | Run backup               | Admin   |
| GET    | `/api/backups/{file}/download` | Download backup         | Admin   |
| GET    | `/api/dashboard/stats`        | Dashboard statistics     | Admin   |
| GET    | `/api/dashboard/pdf`          | Download PDF report      | Admin   |
| GET    | `/api/dashboard/excel`        | Download Excel report    | Admin   |
