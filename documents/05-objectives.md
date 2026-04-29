# Chapter 5 — Objectives

## 5.1 Primary Objectives

1. **Centralized Employee Data Management**
   Design a relational database to store and manage employee information (personal details, department, position, avatar) with full CRUD operations.

2. **Automated Leave Management Workflow**
   Implement a digital leave request and approval pipeline where employees apply online, admins approve/reject, and both parties are notified instantly.

3. **Real-Time Presence Tracking**
   Build a WebSocket-powered presence system allowing employees to broadcast their status (online, away, offline, out-of-office) visible across the organization.

4. **Role-Based Access Control (RBAC)**
   Enforce two-tier access control (Admin and Employee) using API token authentication (Laravel Sanctum), ensuring employees can only access their own data.

5. **Responsive, Modern User Interface**
   Develop a single-page application (SPA) with React that works seamlessly across desktop, tablet, and mobile devices.

6. **Containerized Deployment**
   Package the entire stack (frontend, backend, database) into Docker containers orchestrated via Docker Compose for one-command deployment.

## 5.2 Secondary Objectives

7. **Dashboard Analytics**
   Provide admin users with real-time statistics — total employees, active count, on-leave today, pending requests — with a department distribution chart. Provide employees with a personal home dashboard featuring profile summary, leave heatmap, and upcoming holidays.

8. **Report Generation**
   Enable PDF and Excel export of employee/department reports for offline use and management meetings.

9. **Internal Announcements**
   Allow admins to publish organization-wide announcements with instant notification delivery.

10. **Database Backup & Restore**
    Provide a one-click database backup mechanism with downloadable backup files.

11. **Feature Flag System**
    Allow admins to toggle modules (leave management, announcements, presence tracking, backups) on or off from a settings panel.

12. **Toast Notification System**
    Provide user-friendly success/error/warning feedback for every action using a global toast notification system.

13. **Advanced Leave Management**
    Support configurable leave types (casual, sick, annual, WFH, custom), leave groups with per-type balances, per-employee leave balance tracking, and country-specific holiday calendars.

14. **Contextual Help & User Guide**
    Provide a per-page contextual help system accessible from the navbar, showing relevant user guide content for the current page.

## 5.3 Learning Objectives

| Area                | Skills Demonstrated                                        |
| ------------------- | ---------------------------------------------------------- |
| Frontend            | React SPA, Tailwind CSS, Zustand state management, routing |
| Backend             | Laravel modular architecture, REST API design, Eloquent ORM |
| Database            | MySQL schema design, migrations, foreign keys, seeding      |
| Real-Time           | WebSocket broadcasting with Laravel Reverb                  |
| Security            | Token-based auth (Sanctum), RBAC, CORS, password hashing    |
| DevOps              | Docker, Docker Compose, multi-stage builds, Nginx           |
| Software Engineering| Clean architecture, modular design, separation of concerns  |
