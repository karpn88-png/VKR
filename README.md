# VKR Repository - Full Template

This repository contains a ready-to-run template with:
- Frontend (React + Vite) served on http://localhost:3000 (dev) or via nginx in Docker
- Backend (FastAPI + Uvicorn) served on http://localhost:8000
- AI module (analyzer service) served on http://localhost:5000
- SQLite database stored in `backend/database.db`
- Dockerfiles and docker-compose to run everything with `docker-compose up --build`
- .gitlab-ci.yml configured to run tests/builds using Python 3.13.5 and Node 24.11

## Quick start (without Docker)

### Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux / macOS
# source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend OpenAPI docs: http://localhost:8000/docs

### AI module
```bash
cd ai_module
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn ai_server:app --reload --port 5000
```

AI analyzer endpoint: POST http://localhost:5000/analyze

### Frontend (development)
```bash
cd frontend
npm install
npm run dev    # starts Vite dev server on port 3000
```

### Full run with Docker (recommended)
```bash
docker-compose up --build
```

After docker-compose build:
- Frontend (built + nginx): http://localhost:3000
- Backend (FastAPI): http://localhost:8000
- AI module: http://localhost:5000

## GitLab CI/CD
.gitlab-ci.yml contains stages to test backend, build frontend and run ai checks using images:
- python:3.13.5
- node:24.11

## Notes
- Sentence-Transformers and some transformer models are heavy; if you plan to run models locally, prefer a machine with >=8GB RAM or use an external API.
- The AI module uses `sentence-transformers` if available; otherwise it falls back to a light heuristic.

## SQL bundle import (new database scripts)

Added SQL scripts are stored in `db/sql` and mounted into Postgres as `/docker-entrypoint-initdb.d`.

Execution order:
1. `01_extensions.sql`
2. `02_enum.sql`
3. `03_tables.sql`
4. `04_fk.sql`
5. `05_index.sql`
6. `06_trigers.sql`
7. `07_datas.sql`

Important behavior:
- These scripts run automatically **only when Postgres initializes a fresh data directory** (new empty volume).
- Existing database files/data are preserved because the current named volume `postgres_data` is kept.

If you need to apply scripts to an existing running database manually:
```bash
docker compose exec -T db psql -U vkr -d vkrdb -f /docker-entrypoint-initdb.d/01_extensions.sql
docker compose exec -T db psql -U vkr -d vkrdb -f /docker-entrypoint-initdb.d/02_enum.sql
docker compose exec -T db psql -U vkr -d vkrdb -f /docker-entrypoint-initdb.d/03_tables.sql
docker compose exec -T db psql -U vkr -d vkrdb -f /docker-entrypoint-initdb.d/04_fk.sql
docker compose exec -T db psql -U vkr -d vkrdb -f /docker-entrypoint-initdb.d/05_index.sql
docker compose exec -T db psql -U vkr -d vkrdb -f /docker-entrypoint-initdb.d/06_trigers.sql
docker compose exec -T db psql -U vkr -d vkrdb -f /docker-entrypoint-initdb.d/07_datas.sql
```
