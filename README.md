# Employee Management System

A fullstack **Laravel 13 (REST API) + React 19 (SPA)** application with role-based access control, realtime presence via WebSocket, leave management, announcements, notifications, and admin tooling — all containerised with Docker.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.3+, Laravel 13 |
| Auth | Laravel Sanctum (token-based) |
| Realtime | Laravel Reverb (WebSocket) |
| Queue / Cache / Session | Laravel Queue — database driver |
| Export | maatwebsite/excel (XLSX) + barryvdh/laravel-dompdf (PDF) |
| Backup | spatie/laravel-backup |
| Frontend | React 19, Vite 8, TailwindCSS 3 |
| State management | Zustand |
| Charts | Recharts |
| HTTP client | Axios |
| Container runtime | Docker + Docker Compose |
| Web server (prod) | Nginx (serves built React SPA) |

---

## Project Structure

```
.
├── backend/          # Laravel 13 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── Modules/            # Feature modules
│   │       ├── Announcement/
│   │       ├── Auth/
│   │       ├── Backup/
│   │       ├── Dashboard/
│   │       ├── Demo/
│   │       ├── Department/
│   │       ├── Leave/
│   │       ├── Notification/
│   │       ├── Presence/
│   │       ├── Setting/
│   │       └── User/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   └── Dockerfile
├── frontend/         # React 19 SPA
│   └── src/
│       ├── modules/  # Feature modules (auth, dashboard, employees,
│       │             #   departments, leaves, announcements,
│       │             #   notifications, presence, settings, backup)
│       ├── shared/   # AppLayout, Sidebar, Navbar, ProtectedRoute, RoleGuard
│       ├── store/    # Zustand auth store
│       └── router/   # React Router v6 routes
│   └── Dockerfile
├── docker-compose.yml
└── Makefile          # All developer commands (macOS/Linux/WSL)
```

---

## Default Credentials

| Field | Value |
|---|---|
| Email | `admin@company.com` |
| Password | `Admin@123` |
| Role | Admin |

---

## Features

| Feature | Admin | Employee |
|---|---|---|
| Dashboard stats & charts | ✅ | ✅ |
| Create / manage employees | ✅ | ❌ |
| Edit own profile & bio | ✅ | ✅ |
| Department management | ✅ | ❌ |
| Apply for leave | ✅ | ✅ |
| Approve / reject leave | ✅ | ❌ |
| Cancel own pending leave | ✅ | ✅ |
| Publish announcements | ✅ | ❌ |
| View announcements | ✅ | ✅ |
| In-app notifications (polled every 30 s) | ✅ | ✅ |
| Realtime presence status | ✅ | ✅ |
| Export PDF / Excel report | ✅ | ✅ |
| Feature toggle settings | ✅ | ❌ |
| Backup & download | ✅ | ❌ |
| Seed / reset demo data | ✅ | ❌ |

---

## Quick Start — Docker (recommended)

> **Only requirement: Docker Desktop** (includes Compose).
> No PHP, Composer, Node, or MySQL needed on your machine.

The `make` commands in the Makefile work on **macOS**, **Linux**, and **Windows** (with one of the options below).

### macOS / Linux

```bash
# 1. Clone
git clone <repo-url> employee-management
cd employee-management

# 2. Build images and start everything
make start
```

### Windows

**Option A — Use WSL 2 (recommended)**

WSL gives you a real Linux shell inside Windows. Once set up, all `make` and shell commands work identically.

```powershell
# In PowerShell (run once to install WSL)
wsl --install
# Restart, then open the Ubuntu terminal and follow the macOS/Linux steps above
```

**Option B — Install `make` natively via Chocolatey**

```powershell
# In PowerShell (run once)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco install make -y
```

Then open a **new** PowerShell / Command Prompt and run normally:

```powershell
git clone <repo-url> employee-management
cd employee-management
make start
```

**Option C — Use raw Docker Compose commands (no `make` needed)**

If you don't want to install anything extra, run the Docker commands directly:

```powershell
# Start everything
docker compose up --build -d

# Stop
docker compose down

# Tail logs
docker compose logs -f

# Run migrations manually (if needed)
docker compose exec backend php artisan migrate --force

# Open a shell in the backend container
docker compose exec backend bash
```

---

### What `make start` does

- Verifies Docker is installed and the daemon is running
- Builds the backend container (PHP 8.3, runs migrations + seed on first boot)
- Builds the frontend container (Vite production build served by Nginx)
- Brings up MySQL 8, Laravel API (port 8000), Reverb WebSocket (port 8080), and Nginx (port 3000)

Once all containers are healthy:

| Service | URL |
|---|---|
| **Frontend (React SPA)** | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| WebSocket (Reverb) | ws://localhost:8080 |

Log in with `admin@company.com` / `Admin@123`.

---

### All `make` commands

| Command | Description |
|---|---|
| `make start` | Build + start everything (first-time and subsequent runs) |
| `make stop` | Stop all containers |
| `make restart` | Stop then start |
| `make rebuild` | Force-rebuild all images from scratch |
| `make logs` | Tail logs from all containers (Ctrl-C to exit) |
| `make logs-backend` | Tail backend logs only |
| `make logs-frontend` | Tail frontend logs only |
| `make status` | Show container health status |
| `make migrate` | Run migrations inside the backend container |
| `make seed` | Run database seeders inside the backend container |
| `make fresh` | ⚠ Drop all tables, re-migrate and re-seed |
| `make shell` | Open bash inside the backend container |
| `make tinker` | Open Laravel Tinker REPL |
| `make clean` | ⚠ Stop containers and remove all volumes (destroys DB) |
| `make build-fe` | Rebuild frontend and hot-deploy to running Nginx container |
| `make help` | List all available targets |

---

## Dev Setup — Local (without Docker)

Use this when you want hot-reload on both backend and frontend simultaneously.

### Prerequisites

| Tool | Version | macOS | Windows |
|---|---|---|---|
| PHP | 8.3+ | `brew install php` | [Download from php.net](https://windows.php.net/download/) or `choco install php` |
| Composer | latest | [getcomposer.org](https://getcomposer.org) | [getcomposer.org](https://getcomposer.org) (Windows installer) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) | [nodejs.org](https://nodejs.org) (LTS installer) |
| MySQL | 8+ | `brew install mysql` | [MySQL Installer](https://dev.mysql.com/downloads/installer/) or `choco install mysql` |
| Git | any | `brew install git` | [git-scm.com](https://git-scm.com/download/win) |

> **Windows tip:** Install [Chocolatey](https://chocolatey.org) once and you can install all tools with:
> ```powershell
> choco install php composer nodejs mysql git -y
> ```

---

### 1. Clone the repository

```bash
git clone <repo-url> employee-management
cd employee-management
```

---

### 2. Backend setup

```bash
cd backend
```

**a) Install PHP dependencies**

```bash
composer install
```

**b) Configure environment**

macOS / Linux / Git Bash:
```bash
cp .env.example .env
php artisan key:generate
```

Windows (Command Prompt):
```cmd
copy .env.example .env
php artisan key:generate
```

Windows (PowerShell):
```powershell
Copy-Item .env.example .env
php artisan key:generate
```

Edit `backend/.env` and set your MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=employee_management
DB_USERNAME=root
DB_PASSWORD=your_password
```

All other values (Reverb, Sanctum, Queue, Cache) work with the defaults in `.env.example`.

**c) Create the database**

macOS / Linux:
```bash
mysql -u root -p -e "CREATE DATABASE employee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Windows (Command Prompt or PowerShell — MySQL must be in `PATH`):
```cmd
mysql -u root -p -e "CREATE DATABASE employee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Or open **MySQL Workbench** and run:
```sql
CREATE DATABASE employee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**d) Run migrations and seed**

```bash
php artisan migrate --seed
```

Creates all tables and seeds the default admin account.

**e) Create storage symlink**

```bash
php artisan storage:link
```

> **Windows note:** Run the above in a terminal that has **administrator privileges**, or the symlink creation may fail.

---

### 3. Frontend setup

macOS / Linux:
```bash
cd ../frontend
```

Windows (Command Prompt / PowerShell):
```cmd
cd ..\frontend
```

**a) Install Node dependencies**

```bash
npm install
```

**b) Configure environment**

macOS / Linux / Git Bash:
```bash
cp .env.example .env
```

Windows (Command Prompt):
```cmd
copy .env.example .env
```

Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

The defaults in `.env.example` point to `http://localhost:8000/api` and `ws://localhost:8080`, which match the Laravel dev server and `php artisan reverb:start` out of the box.

---

### 4. Run all services

You need **four terminal tabs** for full functionality. All commands below work on macOS, Linux, and Windows.

**Terminal 1 — Laravel API server**

```bash
cd backend
php artisan serve
# API available at http://localhost:8000
```

**Terminal 2 — Reverb WebSocket server** (realtime presence)

```bash
cd backend
php artisan reverb:start
# WebSocket available at ws://localhost:8080
```

**Terminal 3 — Queue worker** (notifications, presence updates, backup jobs)

```bash
cd backend
php artisan queue:work
```

**Terminal 4 — React dev server** (Vite with HMR)

```bash
cd frontend
npm run dev
# App available at http://localhost:5173
```

Open **http://localhost:5173** and log in with the admin credentials above.

> **Tip (macOS/Linux):** Run all four processes in a single terminal using the Laravel dev script:
> ```bash
> cd backend && composer run dev
> ```
> On Windows this requires [concurrently](https://www.npmjs.com/package/concurrently) to be installed globally (`npm install -g concurrently`).

---

### Deploying local frontend changes to the running Docker container

macOS / Linux / WSL:
```bash
make build-fe
```

Windows (no `make`):
```powershell
cd frontend
npm run build
cd ..
docker compose cp frontend/dist/. frontend:/usr/share/nginx/html/
docker compose exec frontend nginx -s reload
```

---

## API Overview

```
POST   /api/auth/login
DELETE /api/auth/logout
GET    /api/auth/me

GET/POST/PUT/DELETE  /api/users
GET/POST             /api/me

GET/POST             /api/departments
PUT/DELETE           /api/departments/{id}

GET/POST             /api/leaves
PUT                  /api/leaves/{id}/approve
PUT                  /api/leaves/{id}/reject
DELETE               /api/leaves/{id}

GET                  /api/dashboard/stats
GET                  /api/reports/pdf
GET                  /api/reports/excel

GET/POST/PUT/DELETE  /api/announcements

GET                  /api/notifications
PUT                  /api/notifications/{id}/read
PUT                  /api/notifications/read-all

GET/PUT              /api/presence/status

GET/PUT              /api/settings

GET/POST             /api/backups
GET                  /api/backups/{filename}/download
```

---

## Useful Artisan Commands

All commands below work on every OS:

```bash
# Clear all caches
php artisan optimize:clear

# Run a manual backup
php artisan backup:run --only-db

# Start Reverb in debug mode
php artisan reverb:start --debug

# View all registered API routes
php artisan route:list --path=api
```

---

## Troubleshooting

| Problem | macOS fix | Windows fix |
|---|---|---|
| `php: command not found` | Add Homebrew to PATH: `eval "$(/opt/homebrew/bin/brew shellenv)"` | Add PHP to PATH via System Environment Variables, or reinstall via [php.net](https://windows.php.net/download/) |
| `mysql: command not found` | `brew install mysql` | Install [MySQL](https://dev.mysql.com/downloads/installer/) and add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to `PATH` |
| MySQL not running | `brew services start mysql` | Open **Services** (`services.msc`) and start **MySQL80**, or run `net start MySQL80` in an admin terminal |
| `SQLSTATE: Connection refused` | MySQL not running (see above) | MySQL not running (see above) |
| `Class not found` errors | `composer dump-autoload` | `composer dump-autoload` |
| `make: command not found` | `brew install make` | Install via Chocolatey (`choco install make`) or use WSL 2 |
| `cp: command not found` | Should not happen; use `cp` | Use `copy` (CMD) or `Copy-Item` (PowerShell) |
| `php artisan storage:link` fails | — | Run your terminal as **Administrator** |
| Realtime not working | Ensure `php artisan reverb:start` is running | Same — also check Windows Firewall isn't blocking port 8080 |
| Queue jobs not processing | Start `php artisan queue:work` in a separate terminal | Same |
| 419 CSRF / 401 errors | Verify `SANCTUM_STATEFUL_DOMAINS=localhost:5173` in `backend/.env` | Same |
| Docker build fails | `make rebuild` | `docker compose build --no-cache && docker compose up -d` |
| Frontend blank after deploy | `make logs-frontend` | `docker compose logs -f frontend` |
