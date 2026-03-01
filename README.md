# Home Sheets

Local single-user accounting book demo built with **Node.js (Express)** + **React (Vite)**.

## Features
- Master book with 20+ ready support (seeded with: diesel, ice, fish, rubber).
- Book balances from sum of entries.
- Entry types: income/spending (no manual +/- input).
- Integer-only amounts (no decimal currency values).
- Backdated entries allowed.
- Most recent entries shown first.
- Book `verifiedDate`: entries before the verified date cannot be edited/deleted.
- Manual **Save** button (no autosave).
- Persistence format:
  - `backend/data/master.json`
  - `backend/data/books/<book-id>.json` (one file per book)

## Project structure

```text
backend/
  data/
    books/
  src/
    dataStore.js
    server.js
frontend/
  src/
    components/
    pages/
```

## Run locally

### 1) Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:4000`.

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.


## Common issue: "Cannot GET /"

If you open `http://localhost:4000` (backend) you may see `Cannot GET /` or a plain backend message.
That is expected: the **UI is served by Vite** on `http://localhost:5173`.

Use:
- Backend health/API: `http://localhost:4000/api/health`
- Frontend app UI: `http://localhost:5173`

Make sure both processes are running in separate terminals (`npm run dev` in `backend/` and `frontend/`).
