# Appendix A — Installation & Setup Guide

This guide covers how to install and run the Employee Management System on **Windows**, **macOS**, and **Linux**.

---

## A.1 Prerequisites

### Docker Method (Recommended — all platforms)

| Requirement      | Version | Download                                                   |
| ---------------- | ------- | ---------------------------------------------------------- |
| **Docker Desktop** | Latest  | https://www.docker.com/products/docker-desktop/           |
| **Git**          | Any     | https://git-scm.com/download/win                           |

> Docker Desktop bundles Docker Engine + Docker Compose. No PHP, Node, MySQL, or Composer needed.

### Local Method (without Docker)

| Requirement   | Version | Windows Install                                             | macOS Install             |
| ------------- | ------- | ----------------------------------------------------------- | ------------------------- |
| **PHP**       | 8.3+    | `choco install php` or [php.net](https://windows.php.net)   | `brew install php`        |
| **Composer**  | Latest  | [getcomposer.org](https://getcomposer.org) (Windows installer) | `brew install composer` |
| **Node.js**   | 18+     | [nodejs.org](https://nodejs.org) (LTS installer)            | `brew install node`       |
| **MySQL**     | 8+      | `choco install mysql` or [MySQL Installer](https://dev.mysql.com/downloads/installer/) | `brew install mysql` |
| **Git**       | Any     | `choco install git`                                          | `brew install git`        |

> **Windows Tip:** Install [Chocolatey](https://chocolatey.org) first, then install all tools with one command:
> ```powershell
> choco install php composer nodejs mysql git -y
> ```

---

## A.2 Quick Start — Single Command Setup

If you have **Docker Desktop** installed and running, the entire application can be set up with just **two commands**:

```bash
git clone https://github.com/shivamBentley/employee-management.git
cd employee-management && make start
```

Or without `make`:

```bash
git clone https://github.com/shivamBentley/employee-management.git
cd employee-management && docker compose up --build -d
```

This single command will automatically:
1. Build the Docker images (PHP/Laravel backend, React/Nginx frontend, MySQL database)
2. Install all PHP (Composer) and Node.js (npm) dependencies
3. Run database migrations and seeders
4. Start all three containers

Once the containers are healthy (~1–2 minutes), open **http://localhost:3000** and log in with `admin@company.com` / `Admin@123`.

---

## A.3 Docker Setup — Detailed Steps

### Step 1 — Clone the Repository

**Windows (PowerShell or Command Prompt):**
```powershell
git clone https://github.com/shivamBentley/employee-management.git
cd employee-management
```

**macOS / Linux (Terminal):**
```bash
git clone https://github.com/shivamBentley/employee-management.git
cd employee-management
```

### Step 2 — Start the Application

**Windows — Option A: WSL 2 (Recommended)**

WSL gives you a real Linux shell inside Windows. Once set up, everything works exactly like macOS/Linux.

```powershell
# In PowerShell (run once to install WSL)
wsl --install

# Restart your computer, then open the Ubuntu terminal
# Follow the macOS/Linux commands below
```

**Windows — Option B: Using `make` (install via Chocolatey)**

```powershell
# Install make (run once)
choco install make -y

# Then in a new PowerShell window:
cd employee-management
make start
```

**Windows — Option C: Raw Docker Compose (no `make` needed)**

```powershell
cd employee-management
docker compose up --build -d
```

**macOS / Linux:**

```bash
cd employee-management
make start
```

### Step 3 — Access the Application

Wait 1–2 minutes for all containers to become healthy, then open:

| Service                | URL                          |
| ---------------------- | ---------------------------- |
| **Frontend (React UI)**| http://localhost:3000         |
| Backend API            | http://localhost:8000/api     |
| WebSocket (Reverb)     | ws://localhost:8080           |

### Step 4 — Login

| Field    | Value              |
| -------- | ------------------ |
| Email    | `admin@company.com`|
| Password | `Admin@123`        |
| Role     | Admin              |

### Useful Docker Commands

| Task                     | Windows (PowerShell)                                | macOS/Linux            |
| ------------------------ | --------------------------------------------------- | ---------------------- |
| Start all services       | `docker compose up --build -d`                      | `make start`           |
| Stop all services        | `docker compose down`                               | `make stop`            |
| View logs                | `docker compose logs -f`                            | `make logs`            |
| Run migrations           | `docker compose exec backend php artisan migrate --force` | `make migrate`   |
| Seed database            | `docker compose exec backend php artisan db:seed`   | `make seed`            |
| Reset database           | `docker compose exec backend php artisan migrate:fresh --seed` | `make fresh` |
| Open backend shell       | `docker compose exec backend bash`                  | `make shell`           |
| Stop & delete everything | `docker compose down -v`                            | `make clean`           |
| Check container status   | `docker compose ps`                                 | `make status`          |

---

## A.4 Local Setup (Without Docker)

### Windows Setup

#### Step 1 — Install Prerequisites

**Option A: Using Chocolatey (Recommended)**

Open **PowerShell as Administrator** and install Chocolatey:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Then install all tools:

```powershell
choco install php composer nodejs mysql git -y
```

Close and reopen PowerShell to refresh `PATH`.

**Option B: Manual Installation**

1. **PHP 8.3** — Download from https://windows.php.net/download/ → Extract to `C:\php` → Add `C:\php` to system `PATH`
2. **Composer** — Download installer from https://getcomposer.org/download/ → Run the `.exe` installer
3. **Node.js 18+** — Download LTS from https://nodejs.org → Run the `.msi` installer
4. **MySQL 8** — Download from https://dev.mysql.com/downloads/installer/ → Choose "Server only" → Set root password during install
5. **Git** — Download from https://git-scm.com/download/win → Run installer with defaults

Verify installations (open a new PowerShell):

```powershell
php -v
composer -V
node -v
npm -v
mysql --version
git --version
```

#### Step 2 — Clone the Repository

```powershell
git clone https://github.com/shivamBentley/employee-management.git
cd employee-management
```

#### Step 3 — Backend Setup

```powershell
cd backend

# Install PHP dependencies
composer install

# Create environment file
Copy-Item .env.example .env

# Generate application key
php artisan key:generate
```

Edit `backend\.env` in any text editor and set your MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=employee_management
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

Create the database:

```powershell
# Option 1: Command line (MySQL must be in PATH)
mysql -u root -p -e "CREATE DATABASE employee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Option 2: Open MySQL Workbench and run:
# CREATE DATABASE employee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run migrations and seed the database:

```powershell
php artisan migrate --seed
```

Create the storage symlink (**run PowerShell as Administrator**):

```powershell
php artisan storage:link
```

> **Important:** The `storage:link` command requires **administrator privileges** on Windows. Right-click PowerShell → "Run as Administrator".

#### Step 4 — Frontend Setup

Open a **new PowerShell window**:

```powershell
cd employee-management\frontend

# Install Node dependencies
npm install

# Create environment file
Copy-Item .env.example .env
```

The defaults in `.env.example` point to `http://localhost:8000/api` and `ws://localhost:8080`, which work out of the box.

#### Step 5 — Run All Services

You need **4 separate PowerShell windows** (or use Windows Terminal with 4 tabs):

**PowerShell 1 — Laravel API Server:**

```powershell
cd employee-management\backend
php artisan serve
# API running at http://localhost:8000
```

**PowerShell 2 — WebSocket Server (Reverb):**

```powershell
cd employee-management\backend
php artisan reverb:start
# WebSocket running at ws://localhost:8080
```

**PowerShell 3 — Queue Worker:**

```powershell
cd employee-management\backend
php artisan queue:work
```

**PowerShell 4 — React Dev Server (Vite):**

```powershell
cd employee-management\frontend
npm run dev
# App running at http://localhost:5173
```

Open **http://localhost:5173** in your browser and login.

---

### macOS / Linux Setup

#### Step 1 — Install Prerequisites

```bash
# macOS (Homebrew)
brew install php composer node mysql git

# Ubuntu/Debian
sudo apt update
sudo apt install php8.3 php8.3-mysql php8.3-xml php8.3-curl php8.3-mbstring composer nodejs npm mysql-server git
```

#### Step 2 — Clone & Setup Backend

```bash
git clone https://github.com/shivamBentley/employee-management.git
cd employee-management/backend

composer install
cp .env.example .env
php artisan key:generate

# Create database
mysql -u root -p -e "CREATE DATABASE employee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Edit .env with your MySQL credentials, then:
php artisan migrate --seed
php artisan storage:link
```

#### Step 3 — Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

#### Step 4 — Run All Services

```bash
# Terminal 1: API
cd backend && php artisan serve

# Terminal 2: WebSocket
cd backend && php artisan reverb:start

# Terminal 3: Queue
cd backend && php artisan queue:work

# Terminal 4: Frontend
cd frontend && npm run dev
```

Or use the Laravel dev script (runs all in one terminal):

```bash
cd backend && composer run dev
```

Open **http://localhost:5173** and login.

---

## A.5 Troubleshooting

| Problem                                          | Solution                                                      |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `docker: command not found`                      | Install Docker Desktop and restart terminal                    |
| `make: command not found` (Windows)              | Use `docker compose` commands directly or install via `choco install make` |
| `SQLSTATE[HY000] [2002] Connection refused`      | MySQL is not running. Start MySQL service                      |
| `storage:link` fails on Windows                  | Run PowerShell as Administrator                                |
| Port 3000/8000/3306 already in use               | Stop the conflicting service or change ports in `.env` / `docker-compose.yml` |
| `vite: command not found`                        | Run `npm install` in the `frontend/` directory first           |
| `npm run build` fails with SyntaxError           | Your Node.js version is too old. Install Node.js 18+           |
| Docker containers unhealthy                      | Run `docker compose logs -f` to check error messages           |
| WebSocket not connecting                         | Ensure `php artisan reverb:start` is running (Terminal 2)      |
| Avatar upload not working                        | Ensure `php artisan storage:link` was run successfully         |

---

## A.6 Environment Variables Reference

### Backend (`backend/.env`)

| Variable          | Default              | Description                    |
| ----------------- | -------------------- | ------------------------------ |
| `APP_URL`         | `http://localhost:8000` | Application URL              |
| `DB_HOST`         | `127.0.0.1`          | Database host (Docker: `mysql`)|
| `DB_PORT`         | `3306`               | MySQL port                     |
| `DB_DATABASE`     | `employee_management`| Database name                  |
| `DB_USERNAME`     | `root`               | Database user                  |
| `DB_PASSWORD`     | (empty)              | Database password              |
| `REVERB_HOST`     | `0.0.0.0`            | WebSocket bind address         |
| `REVERB_PORT`     | `8080`               | WebSocket port                 |

### Frontend (`frontend/.env`)

| Variable            | Default                        | Description                  |
| ------------------- | ------------------------------ | ---------------------------- |
| `VITE_API_URL`      | `http://localhost:8000/api`    | Backend API URL              |
| `VITE_REVERB_HOST`  | `localhost`                    | WebSocket host               |
| `VITE_REVERB_PORT`  | `8080`                         | WebSocket port               |
| `VITE_REVERB_SCHEME`| `ws`                           | WebSocket protocol           |
