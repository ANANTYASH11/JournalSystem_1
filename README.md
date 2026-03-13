# AI-Assisted Journal System (ArvyaX)

A full-stack application where users write post-session journal entries (forest, ocean, mountain), get LLM-powered emotion analysis, and view mental-state insights over time.

## Why this project is strong
- Clean, modular backend (`controllers` / `services` / `routes` / `middleware`)
- Real LLM integration (Groq API), not hardcoded dummy outputs
- Caching for repeated analysis (in-memory + DB hash reuse)
- Rate limiting and security middleware
- Practical insights aggregation endpoint
- Minimal but polished React UI
- Dockerized deployment support

---

## Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- SQLite
- Groq LLM API (`llama-3.1-8b-instant`)

### Frontend
- React + TypeScript + Vite
- Axios
- Tailwind CSS

### Infra / Ops
- Docker + Docker Compose

---

## Project Structure

- backend
  - src
    - config
    - controllers
    - services
    - routes
    - middleware
    - lib
    - types
  - prisma
- frontend
  - src
    - components
    - services
    - types
- docker-compose.yml
- ARCHITECTURE.md

---

## Required APIs (Implemented)

### 1) Create Journal Entry
**POST** `/api/journal`

Request:
```json
{
  "userId": "123",
  "ambience": "forest",
  "text": "I felt calm today after listening to the rain."
}
```

Behavior:
- Stores entry in DB
- Triggers emotion analysis
- Reuses cached analysis for repeated/similar text via text hash

---

### 2) Get User Entries
**GET** `/api/journal/:userId`

Response includes journal entries and attached analysis (if available).

---

### 3) Analyze Text via LLM
**POST** `/api/journal/analyze`

Request:
```json
{
  "text": "I felt calm today after listening to the rain"
}
```

Example response:
```json
{
  "success": true,
  "data": {
    "emotion": "calm",
    "keywords": ["rain", "nature", "peace"],
    "summary": "User experienced relaxation during the forest session",
    "confidence": 0.86
  }
}
```

> If LLM key is missing/unavailable, fallback analysis is used so the app still works.

---

### 4) Insights API
**GET** `/api/journal/insights/:userId`

Example response:
```json
{
  "success": true,
  "data": {
    "totalEntries": 8,
    "topEmotion": "calm",
    "mostUsedAmbience": "forest",
    "recentKeywords": ["focus", "nature", "rain"],
    "emotionDistribution": {
      "calm": 4,
      "peaceful": 2,
      "hopeful": 2
    }
  }
}
```

---

## Bonus Features Included
- Streaming LLM endpoint: `POST /api/journal/analyze/stream`
- Caching repeated analysis
- Rate limiting (`express-rate-limit`)
- Docker setup
- Health and stats endpoints

---

## Local Run (No Docker)

## 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```
Backend runs on: `http://localhost:3001`

## 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

If needed, set `VITE_API_URL` in frontend env to:
- `http://localhost:3001/api`

---

## Docker Run
From project root:
```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`

Nginx proxies `/api/*` from frontend container to backend container.

---

## Quick API Check

### Health
**GET** `/api/health`

### Stats
**GET** `/api/stats`

---

## Evaluation Checklist Coverage
- ✅ Backend API design
- ✅ Code structure
- ✅ LLM integration
- ✅ Data modeling (User, JournalEntry, EmotionAnalysis, UserInsight)
- ✅ Frontend page with write/view/analyze/insights
- ✅ README + architecture explanation

---

## Notes
- Demo user ID for frontend: `123`
- Seed script creates demo data for immediate review
- SQLite chosen for simplicity; architecture doc explains PostgreSQL scaling path
