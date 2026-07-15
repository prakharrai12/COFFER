# COFFER — Precision Personal Finance & Budget Tracker

*A finance app that looks like it was built by people who take money seriously — quiet, precise, confident. Not another purple-gradient SaaS dashboard.*

---

## What is COFFER?

**COFFER** is an end-to-end personal finance and budget tracker designed to eliminate spreadsheet friction without sacrificing visual precision or data density. Unlike cartoonish budgeting apps or generic AI-generated dashboards, COFFER adheres to a restrained, high-contrast typographic hierarchy (*Fraunces*, *General Sans*, and *JetBrains Mono* tabular figures) and a curated color system tailored for financial clarity.

### Core Features
- **Authentication & Security**: Email/password registration with real-time password strength indicators, JWT short-lived access tokens, and `httpOnly` cookie-persisted refresh sessions.
- **Accounts & Multi-Currency**: Create and manage multiple accounts (`Checking`, `Cash`, `Credit Card`, `Savings`) with running balance calculations and customizable display currencies (`$ USD`, `₹ INR`, `€ EUR`, `£ GBP`).
- **Precision Transactions Management**: Log income and expenses with date, account, category, and notes. Features a dense financial table layout with right-aligned tabular numbers, multi-attribute filtering (by date range, account, and category), and instant text search.
- **Smart Category Management**: Sensible default categories seeded on first run (`Food`, `Rent`, `Transport`, `Utilities`, `Entertainment`, `Income`, etc.) with 12-swatch color coding. Deleting a category in use prompts safe transaction reassignment—never silently orphaning historical data.
- **Monthly Budgets & Status Tracking**: Set category spending limits with thin full-bleed budget bars and smooth color transitions (`Vault Green` under budget → `Warning Amber` at >85% → `Rust Red` when over limit).
- **Dashboard (Home Screen)**: Answers *"How am I doing this month?"* in under 3 seconds. Features a high-impact Net Income display in *Fraunces*, budget status summaries, a Recharts donut breakdown with `anime.js` segment reveals, and a recent transactions ledger.
- **Recurring Transactions Engine**: Mark regular bills or income as recurring (`Weekly` or `Monthly`) to auto-generate transactions on schedule.
- **Historical Reports & Trends**: Browse historical monthly trends and analyze multi-month income vs. spend dynamics using interactive charts.
- **Restrained Motion System**: Purposeful animation divided cleanly between **GSAP** (orchestrated count-ups, `Flip` transitions, and budget bar snaps) and **anime.js** (list entrance staggers and micro-interactions), with full `prefers-reduced-motion` and accessibility support (`aria-live` numeric updates).

---

## Tech Stack

- **Frontend**: React 19 + Vite, Tailwind CSS (locked design token configuration), `react-router-dom`, `Recharts`, `GSAP` + `anime.js`, `lucide-react`.
- **Backend**: Node.js + Express, Prisma ORM, `bcryptjs`, `jsonwebtoken`, `cookie-parser`.
- **Database**: Relational SQL storage via Prisma. Configured out-of-the-box for **SQLite (`dev.db`)** for zero-friction local development and automated testing, cleanly swappable to **PostgreSQL** (`provider = "postgresql"`) in production environments.

---

## Setup Instructions

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm** (v10+ recommended)

### 1. Clone & Environment Setup
Clone the repository and inspect `.env.example`:
```bash
git clone https://github.com/prakharrai12/COFFER.git
cd COFFER
```

### 2. Backend Setup (`/backend`)
Navigate to the backend directory, install dependencies, configure environment variables, and run database migrations:
```bash
cd backend
npm install

# Copy configuration template
cp .env.example .env

# Run Prisma database schema migration (creates dev.db)
npx prisma migrate dev --name init

# Seed default database structures (optional/auto-handled on user creation)
npm run seed
```

#### Running the Backend Dev Server:
```bash
npm run dev
```
The backend API server will start on **`http://localhost:5000`**.

---

### 3. Frontend Setup (`/frontend`)
Open a new terminal window, navigate to the frontend directory, install dependencies, and start the Vite dev server:
```bash
cd frontend
npm install

# Run Vite dev server
npm run dev
```
The application UI will start on **`http://localhost:5173`**.

---

## Automated Testing

To run the automated test suite verifying backend authentication, JWT management, account balances, transaction filtering, and budget limits:
```bash
cd backend
npm test
```

---

## Design Philosophy & Spacing Tokens

COFFER strictly enforces a `4px` base spacing scale (`4, 8, 12, 16, 24, 32, 48, 64, 96px`) across every margin, padding, and gap. All numeric columns use right-aligned JetBrains Mono with `font-variant-numeric: tabular-nums` to ensure exact columnar precision.
