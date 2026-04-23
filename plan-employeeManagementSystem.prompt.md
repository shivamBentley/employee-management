# Plan: Employee Management System (College Project)

**TL;DR** — A Laravel 11 (REST API) + React 18 (SPA) fullstack app with MySQL, Laravel Reverb for realtime presence, and role-based access (Admin/Employee). Built in 8 independent phases, each independently verifiable.

---

## Tech Stack Decisions

| Layer | Choice | Reason |
|---|---|---|
| Backend | Laravel 11 | Clean MVC, rich ecosystem |
| Auth | Laravel Sanctum | Simpler than Passport, ideal for SPA |
| Realtime | Laravel Reverb | Built-in WebSocket, no external account needed |
| Frontend | React 18 + Vite + TailwindCSS | Fast dev, modern |
| Charts | Recharts | React-native, easy to use |
| Reports | spatie/laravel-excel + DomPDF | PDF + Excel exports |
| Backup | spatie/laravel-backup | Production-grade, admin UI |
| No tests | — | Excluded per your instruction |

---

## Database Schema (8 tables)

1. **`users`** — id, name, email, password, role (`admin|employee`), department_id, position, phone, bio, avatar, is_active
2. **`departments`** — id, name, description
3. **`presence`** — id, user_id, status (`online|offline|away|out_of_office`), last_seen
4. **`leaves`** — id, user_id, type (`casual|sick|annual|wfh`), start_date, end_date, status (`pending|approved|rejected`), reason, approved_by, scheduled_at
5. **`announcements`** — id, title, content, author_id
6. **`notifications`** — id, user_id, type, title, body, read_at
7. **`settings`** — id, key, value, scope (`global|admin|employee`)
8. **`backups`** — id, filename, size, created_by

---

## Modular Project Structure

```
employee-management/
├── backend/                          # Laravel 11 API
│   ├── app/
│   │   ├── Modules/                  # Feature modules (each self-contained)
│   │   │   ├── Auth/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── AuthController.php
│   │   │   │   ├── Requests/
│   │   │   │   │   └── LoginRequest.php
│   │   │   │   └── routes.php
│   │   │   ├── User/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── UserController.php
│   │   │   │   ├── Models/
│   │   │   │   │   └── User.php
│   │   │   │   ├── Policies/
│   │   │   │   │   └── UserPolicy.php
│   │   │   │   ├── Resources/
│   │   │   │   │   └── UserResource.php
│   │   │   │   ├── Requests/
│   │   │   │   │   ├── StoreUserRequest.php
│   │   │   │   │   └── UpdateUserRequest.php
│   │   │   │   └── routes.php
│   │   │   ├── Department/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── DepartmentController.php
│   │   │   │   ├── Models/
│   │   │   │   │   └── Department.php
│   │   │   │   ├── Resources/
│   │   │   │   │   └── DepartmentResource.php
│   │   │   │   └── routes.php
│   │   │   ├── Leave/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── LeaveController.php
│   │   │   │   ├── Models/
│   │   │   │   │   └── Leave.php
│   │   │   │   ├── Jobs/
│   │   │   │   │   └── SetPresenceOutOfOfficeJob.php
│   │   │   │   ├── Resources/
│   │   │   │   │   └── LeaveResource.php
│   │   │   │   └── routes.php
│   │   │   ├── Presence/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── PresenceController.php
│   │   │   │   ├── Events/
│   │   │   │   │   └── PresenceUpdated.php
│   │   │   │   ├── Models/
│   │   │   │   │   └── Presence.php
│   │   │   │   └── routes.php
│   │   │   ├── Announcement/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── AnnouncementController.php
│   │   │   │   ├── Jobs/
│   │   │   │   │   └── NotifyEmployeesJob.php
│   │   │   │   ├── Models/
│   │   │   │   │   └── Announcement.php
│   │   │   │   └── routes.php
│   │   │   ├── Notification/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── NotificationController.php
│   │   │   │   ├── Models/
│   │   │   │   │   └── Notification.php
│   │   │   │   └── routes.php
│   │   │   ├── Dashboard/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── DashboardController.php
│   │   │   │   └── routes.php
│   │   │   ├── Setting/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── SettingController.php
│   │   │   │   ├── Middleware/
│   │   │   │   │   └── FeatureEnabled.php
│   │   │   │   ├── Models/
│   │   │   │   │   └── Setting.php
│   │   │   │   └── routes.php
│   │   │   └── Backup/
│   │   │       ├── Controllers/
│   │   │       │   └── BackupController.php
│   │   │       └── routes.php
│   │   └── Providers/
│   │       └── ModuleServiceProvider.php   # auto-loads all module routes
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── AdminSeeder.php
│   ├── routes/
│   │   └── api.php                         # imports module routes
│   └── config/
│       └── modules.php                     # enabled/disabled module list
│
└── frontend/                         # React 18 + Vite SPA
    ├── src/
    │   ├── modules/                  # mirrors backend modules
    │   │   ├── auth/
    │   │   │   ├── pages/
    │   │   │   │   └── LoginPage.jsx
    │   │   │   ├── hooks/
    │   │   │   │   └── useAuth.js
    │   │   │   └── api.js
    │   │   ├── employees/
    │   │   │   ├── pages/
    │   │   │   │   ├── EmployeeListPage.jsx
    │   │   │   │   └── EmployeeProfilePage.jsx
    │   │   │   ├── components/
    │   │   │   │   └── EmployeeTable.jsx
    │   │   │   └── api.js
    │   │   ├── leaves/
    │   │   │   ├── pages/
    │   │   │   │   ├── LeaveListPage.jsx
    │   │   │   │   └── ApplyLeavePage.jsx
    │   │   │   ├── components/
    │   │   │   │   └── LeaveCalendar.jsx
    │   │   │   └── api.js
    │   │   ├── dashboard/
    │   │   │   ├── pages/
    │   │   │   │   └── DashboardPage.jsx
    │   │   │   ├── components/
    │   │   │   │   ├── StatCard.jsx
    │   │   │   │   └── DepartmentChart.jsx
    │   │   │   └── api.js
    │   │   ├── presence/
    │   │   │   ├── components/
    │   │   │   │   ├── StatusBadge.jsx
    │   │   │   │   └── StatusDropdown.jsx
    │   │   │   └── hooks/
    │   │   │       └── usePresence.js
    │   │   ├── announcements/
    │   │   │   ├── pages/
    │   │   │   │   └── AnnouncementsPage.jsx
    │   │   │   ├── components/
    │   │   │   │   └── AnnouncementCard.jsx
    │   │   │   └── api.js
    │   │   ├── notifications/
    │   │   │   ├── components/
    │   │   │   │   ├── NotificationBell.jsx
    │   │   │   │   └── NotificationDropdown.jsx
    │   │   │   └── hooks/
    │   │   │       └── useNotifications.js
    │   │   ├── settings/
    │   │   │   ├── pages/
    │   │   │   │   └── SettingsPage.jsx
    │   │   │   └── api.js
    │   │   └── backup/
    │   │       ├── pages/
    │   │       │   └── BackupPage.jsx
    │   │       └── api.js
    │   ├── shared/                   # cross-module reusables
    │   │   ├── components/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── RoleGuard.jsx
    │   │   ├── hooks/
    │   │   │   └── useApi.js
    │   │   └── utils/
    │   │       └── axios.js          # Axios instance with token interceptor
    │   ├── router/
    │   │   └── index.jsx             # React Router v6 route definitions
    │   ├── store/
    │   │   └── authStore.js          # Zustand auth store
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

> **Convention:** Each backend module owns its own Controller, Model, Policy, Resource, Requests, Jobs/Events, and `routes.php`. `ModuleServiceProvider` auto-registers all module route files so `routes/api.php` stays clean. Frontend modules mirror this — each has its own `pages/`, `components/`, and `api.js` (Axios calls for that module only).

---

## Implementation Phases

### Phase 1 — Scaffold & Auth
1. `laravel new backend` — configure MySQL, Sanctum, CORS middleware
2. Create all 8 migrations + run them
3. **AdminSeeder** → seeds default admin: `admin@company.com` / `Admin@123`
4. `AuthController`: `login`, `logout`, `me`
5. React scaffold with Vite + TailwindCSS + React Router v6
6. Login page + protected route guard + Axios interceptor with token

### Phase 2 — Employee & Department CRUD
1. `UserController`: list, show, store *(admin only)*, update *(own data)*, delete
2. `DepartmentController`: full CRUD *(admin only)*
3. `UserPolicy`: employee may only update their own record
4. React: Employee table (admin), Self-profile edit page, Department management

### Phase 3 — Leave Management
1. `LeaveController`: apply, list, cancel, approve/reject *(admin)*
2. Leave types pulled from `settings` table (configurable)
3. Queue job: on approved leave start_date → auto-set presence to `out_of_office`
4. React: Leave form, calendar view, admin approval queue

### Phase 4 — Dashboard & Reports
1. `DashboardController`: headcount, today's present/absent, leave stats, department breakdown
2. Export endpoints: `/reports/pdf`, `/reports/excel`
3. React: Stat cards, Recharts bar/pie charts, download buttons

### Phase 5 — Realtime Presence & Bio/Status
1. Configure **Laravel Reverb** (WebSocket server)
2. `PresenceController`: update status endpoint
3. Broadcast `PresenceUpdated` event on status change
4. React: Status badge on all avatars, "Set Status" dropdown (Teams-style), last seen display
5. Bio + avatar upload on profile page

### Phase 6 — Announcements & Notifications
1. `AnnouncementController`: CRUD *(admin)*, list *(all)*
2. On announcement publish → dispatch `NotifyEmployeesJob` → bulk-insert notification records
3. `NotificationController`: list own, mark-as-read, mark-all-read
4. React: Bell icon with unread badge, dropdown list, announcements feed page

### Phase 7 — Settings (Feature Toggles)
1. `SettingController`: get/update settings
2. Keys: `leave_management_enabled`, `announcements_enabled`, `presence_tracking_enabled`, `backup_enabled`
3. `FeatureEnabled` middleware — checks setting before each feature route group
4. React: Admin settings toggle page, employee view of enabled features

### Phase 8 — Backup & Restore *(Admin only)*
1. `BackupController`: trigger backup, list backups, download, restore from upload
2. Powered by `spatie/laravel-backup` package
3. React: Backup management UI with restore confirmation dialog

---

## API Route Summary

```
POST   /api/auth/login           → get token
DELETE /api/auth/logout

GET/POST/PUT/DELETE /api/users   → admin CRUD
GET/PUT            /api/me       → own profile

GET/POST           /api/leaves
PUT                /api/leaves/{id}/approve|reject

GET                /api/dashboard/stats
GET                /api/reports/pdf|excel

GET/POST/PUT/DELETE /api/announcements
GET/PUT            /api/notifications/{id}/read

PUT                /api/presence/status
GET/PUT            /api/settings
POST/GET           /api/backups
POST               /api/backups/restore
```

---

## Default Credentials

- **Admin:** `admin@company.com` / `Admin@123` (seeded via `AdminSeeder`)

---

## Verification Checklist

1. Admin can create/edit/delete employees; employee gets `403` if they try
2. Employee can only update their own profile
3. Leave approval triggers presence update on start date via queue
4. New announcement auto-creates notifications for all employees
5. Feature toggle middleware returns `403` when a feature is disabled
6. Backup download works and restore re-seeds data
7. Realtime presence badge updates without page refresh

---

## Roles & Permissions

| Action | Admin | Employee |
|---|---|---|
| Create employee | ✅ | ❌ |
| Edit any employee | ✅ | ❌ |
| Delete employee | ✅ | ❌ |
| Edit own profile | ✅ | ✅ |
| Approve/reject leave | ✅ | ❌ |
| Apply for leave | ✅ | ✅ |
| Publish announcements | ✅ | ❌ |
| View announcements | ✅ | ✅ |
| Manage settings | ✅ | ❌ |
| Backup & restore | ✅ | ❌ |

---

## Decisions & Exclusions

- **No tests** — excluded until explicitly requested
- **No GraphQL** — REST is sufficient
- **Reverb over Pusher** — no account/API key needed for college setup
- **Sanctum over Passport** — simpler token auth for SPA
