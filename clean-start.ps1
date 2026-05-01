# Employee Management System — Clean Start Script (Windows PowerShell)
# Equivalent to: make clean-start
# Stops containers, wipes volumes & cache, rebuilds, starts fresh (images kept)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$BORDER = "=" * 48

# ── Requirements check ──────────────────────────────
Write-Host ""
Write-Host $BORDER
Write-Host "  Checking requirements..."
Write-Host $BORDER

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "  x  Docker is not installed. Install from https://docs.docker.com/get-docker/"
    exit 1
}
Write-Host "  ok  Docker found: $(docker --version)"

docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  x  Docker daemon is not running. Please start Docker Desktop."
    exit 1
}
Write-Host "  ok  Docker daemon is running"

docker compose version 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  x  Docker Compose plugin not found. Update Docker Desktop."
    exit 1
}
Write-Host "  ok  Docker Compose found: $(docker compose version --short)"
Write-Host "  ok  All requirements satisfied!"
Write-Host $BORDER
Write-Host ""

# ── Stop & wipe ─────────────────────────────────────
Write-Host $BORDER
Write-Host "  Clean-start: stopping containers..."
Write-Host $BORDER

docker compose down -v --remove-orphans
Write-Host "  ok  Containers and volumes removed."

# ── Prune build cache ───────────────────────────────
Write-Host ""
Write-Host "  Pruning dangling build cache (not images)..."
docker builder prune -f
Write-Host "  ok  Build cache cleared."

# ── Clear Laravel bootstrap cache ───────────────────
Write-Host ""
Write-Host "  Removing backend framework cache..."
$cacheDir = "backend\bootstrap\cache"
if (Test-Path $cacheDir) {
    Get-ChildItem -Path $cacheDir -Filter "*.php" | Remove-Item -Force
}
Write-Host "  ok  Laravel bootstrap cache cleared."

# ── Build & start ───────────────────────────────────
Write-Host ""
Write-Host "  Rebuilding and starting services..."
Write-Host $BORDER

docker compose up --build -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# ── Wait for backend healthy ────────────────────────
Write-Host ""
Write-Host "  Waiting for backend to become healthy..."
Write-Host -NoNewline "  "
while ($true) {
    $status = docker inspect --format='{{.State.Health.Status}}' ems_backend 2>$null
    if ($status -eq "healthy") { break }
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 2
}
Write-Host ""

# ── Done ────────────────────────────────────────────
Write-Host $BORDER
Write-Host "  ok  All services are up and healthy!"
Write-Host ""
Write-Host "  Frontend  ->  http://localhost:3000"
Write-Host "  Backend   ->  http://localhost:8000"
Write-Host "  WebSocket ->  ws://localhost:8080"
Write-Host ""
Write-Host "  Default login:"
Write-Host "    Email:    admin@company.com"
Write-Host "    Password: Admin@123"
Write-Host $BORDER
