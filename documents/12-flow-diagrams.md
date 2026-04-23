# Chapter 12 — System Flow Diagrams

## 12.1 Overall System Flow

```mermaid
flowchart TB
    START([User opens browser]) --> LOGIN{Authenticated?}
    LOGIN -->|No| LOGINPAGE[Login Page<br>Enter email + password]
    LOGINPAGE --> AUTH[POST /api/login]
    AUTH -->|Success| STORE[Store token in<br>localStorage + Zustand]
    AUTH -->|Fail| LOGINPAGE
    STORE --> DASHBOARD

    LOGIN -->|Yes| DASHBOARD[Dashboard]

    DASHBOARD --> NAV{Navigate to}
    NAV --> EMP[Employees]
    NAV --> DEPT[Departments]
    NAV --> LEAVE[Leaves]
    NAV --> ANN[Announcements]
    NAV --> PROFILE[My Profile]
    NAV --> SETTINGS[Settings]
    NAV --> BACKUP[Backup]

    EMP --> EMP_CRUD[List / Create /<br>Edit / Delete]
    DEPT --> DEPT_CRUD[List / Create /<br>Rename / Delete]
    LEAVE --> LEAVE_FLOW[Apply / Approve /<br>Reject / Cancel]
    ANN --> ANN_FLOW[Publish / View /<br>Delete]
    PROFILE --> PROFILE_EDIT[Edit name, phone,<br>bio, avatar]
    SETTINGS --> TOGGLE[Toggle feature flags]
    BACKUP --> BKP_FLOW[Run backup /<br>Download]
```

## 12.2 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as React Frontend
    participant A as Laravel API
    participant D as MySQL

    U->>F: Enter email + password
    F->>A: POST /api/login {email, password}
    A->>D: SELECT * FROM users WHERE email = ?
    D-->>A: User record
    A->>A: Verify password (bcrypt)

    alt Valid credentials
        A->>D: INSERT personal_access_tokens
        A-->>F: 200 {token, user}
        F->>F: Store in authStore (Zustand + localStorage)
        F->>U: Redirect to /dashboard
    else Invalid credentials
        A-->>F: 401 "Invalid credentials"
        F->>U: Show error toast
    end

    Note over F,A: Subsequent requests
    U->>F: Click any feature
    F->>A: GET /api/users (Authorization: Bearer {token})
    A->>A: Sanctum validates token
    A-->>F: 200 JSON response
```

## 12.3 Leave Management Flow

```mermaid
flowchart TB
    subgraph "Employee Actions"
        E1([Employee]) --> E2[Open Leave Page]
        E2 --> E3[Click 'Apply Leave']
        E3 --> E4[Fill form:<br>Type, Dates, Reason]
        E4 --> E5[POST /api/leaves]
        E5 --> E6[Leave created<br>Status: PENDING]
        E6 --> E7[Toast: 'Leave submitted']
    end

    subgraph "System"
        E6 --> N1[Create notification<br>for all admins]
        N1 --> N2[WebSocket broadcast<br>to admin clients]
    end

    subgraph "Admin Actions"
        A1([Admin]) --> A2[View Leave List]
        A2 --> A3{Action?}
        A3 -->|Approve| A4[POST /leaves/{id}/approve]
        A3 -->|Reject| A5[POST /leaves/{id}/reject]
        A4 --> A6[Status → APPROVED]
        A5 --> A7[Status → REJECTED]
        A6 --> A8[Notify employee]
        A7 --> A8
    end

    N2 -.->|Real-time bell| A2

    style E6 fill:#FFD43B,color:#000
    style A6 fill:#51CF66,color:#fff
    style A7 fill:#FF6B6B,color:#fff
```

## 12.4 Employee CRUD Flow

```mermaid
flowchart LR
    subgraph "Admin"
        A1[Employee List Page] --> A2{Action}
        A2 -->|Create| A3[Open Modal<br>Fill form]
        A2 -->|Edit| A4[Navigate to<br>Profile Page]
        A2 -->|Delete| A5[Confirm dialog]

        A3 --> A6[POST /api/users]
        A4 --> A7[PUT /api/users/{id}]
        A5 --> A8[DELETE /api/users/{id}]

        A6 -->|Success| A9[Toast + Refresh list]
        A7 -->|Success| A9
        A8 -->|Success| A9
    end
```

## 12.5 Presence Tracking Flow

```mermaid
sequenceDiagram
    participant E as Employee Browser
    participant WS as Reverb WebSocket
    participant DB as MySQL
    participant A as Admin Browser

    E->>WS: Connect (WebSocket handshake)
    E->>WS: Set status = "online"
    WS->>DB: UPDATE presence SET status = 'online'
    WS-->>A: Broadcast: {user_id, status: "online"}
    A->>A: Update StatusBadge in employee list

    Note over E: Employee goes idle
    E->>WS: Set status = "away"
    WS->>DB: UPDATE presence SET status = 'away'
    WS-->>A: Broadcast: {user_id, status: "away"}

    Note over E: Employee leaves
    E->>WS: Set status = "offline"
    WS->>DB: UPDATE presence SET status = 'offline'
    WS-->>A: Broadcast: {user_id, status: "offline"}
```

## 12.6 Announcement Publishing Flow

```mermaid
flowchart TB
    A1([Admin]) --> A2[Click 'New' button]
    A2 --> A3[Fill title + content]
    A3 --> A4[POST /api/announcements]
    A4 --> A5[Record created in DB]
    A5 --> A6[Create notifications<br>for ALL users]
    A6 --> A7[WebSocket broadcast<br>to all connected clients]
    A7 --> A8[All users see<br>notification bell badge]
    A8 --> A9[Toast: 'Announcement published']
```

## 12.7 Backup Flow

```mermaid
flowchart LR
    A1([Admin]) --> A2[Backup Page]
    A2 --> A3[Click 'Run Backup']
    A3 --> A4[POST /api/backups]
    A4 --> A5[Spatie Backup<br>runs mysqldump]
    A5 --> A6[File saved to<br>storage/backups/]
    A6 --> A7[Record inserted<br>in backups table]
    A7 --> A8[Toast: 'Backup started']
    A8 --> A9[List refreshes<br>after 3 seconds]

    A2 --> A10[Click 'Download']
    A10 --> A11[GET /backups/{file}/download]
    A11 --> A12[Browser downloads<br>.sql/.zip file]
```

## 12.8 Report Export Flow

```mermaid
flowchart LR
    A1([Admin]) --> A2[Dashboard Page]
    A2 --> A3{Export type}
    A3 -->|PDF| A4[GET /api/dashboard/pdf]
    A3 -->|Excel| A5[GET /api/dashboard/excel]
    A4 --> A6[DomPDF generates<br>PDF document]
    A5 --> A7[Maatwebsite Excel<br>generates XLSX]
    A6 --> A8[Browser downloads file]
    A7 --> A8
```

## 12.9 Feature Flag Flow

```mermaid
flowchart TB
    A1([Admin]) --> A2[Settings Page]
    A2 --> A3[Toggle switches for:<br>• Leave Management<br>• Announcements<br>• Presence Tracking<br>• Backup & Restore]
    A3 --> A4[Click 'Save Settings']
    A4 --> A5[PUT /api/settings]
    A5 --> A6[Settings stored<br>in settings table]
    A6 --> A7[settingsStore<br>invalidated]
    A7 --> A8[All pages check<br>useFeatureFlag hook]
    A8 -->|Disabled| A9[Show 'Feature Disabled'<br>banner]
    A8 -->|Enabled| A10[Module works normally]
```
