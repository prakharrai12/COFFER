# COFFER — Precision Personal Finance & Budget Tracker

*A finance app that looks like it was built by people who take money seriously — quiet, precise, confident. Not another purple-gradient SaaS dashboard.*

---

## What is COFFER?

**COFFER** is a production-grade, end-to-end personal finance and budget tracker designed to eliminate spreadsheet friction without sacrificing visual precision or data density. Unlike cartoonish budgeting apps or generic AI-generated dashboards, COFFER adheres to a restrained, high-contrast typographic hierarchy (*Fraunces*, *General Sans*, and *JetBrains Mono* tabular figures) and a curated color system (`#F7F5F0` warm paper canvas, `#141614` deep charcoal ink, `#1F5F4D` vault green) tailored for surgical financial clarity.

### Core Architecture & Features
- **Authentication & Security (`/api/auth`)**: Email/password registration with real-time password strength indicators, JWT short-lived access tokens (15m), and `httpOnly` cookie-persisted refresh sessions (7d) with automatic client token rotation. Password reset flow protected by SHA-256 token hashes.
- **Multi-Currency Treasury Accounts (`/api/accounts`)**: Create and manage multiple accounts (`Checking`, `Savings Vault`, `Credit Card`, `Cash`, `Investment Portfolio`) with running balance calculations and customizable display currencies (`$ USD`, `₹ INR`, `€ EUR`, `£ GBP`, `¥ JPY`, `CA$ CAD`, `A$ AUD`).
- **High-Density Ledger (`/api/transactions`)**: Log income and expenses with date, target account, color-coded category, and notes. Features a dense financial table layout (`<Table />`) with right-aligned tabular numerals (`.tabular-nums`), multi-attribute surgical filtering (by date bounds, account, flow type, and category), and instant memo text search.
- **Safe Category Vault & Reassignment (`/api/categories`)**: Sensible default categories seeded on initial account initialization (`Food & Groceries`, `Housing & Rent`, `Transportation`, `Utilities`, `Entertainment`, `Income / Salary`, etc.) with 12-swatch color coding. Deleting a category in active use prompts safe transaction reassignment (`POST /api/categories/:id/safe-delete`)—never silently orphaning historical transaction data.
- **Budget Telemetry & Limit Enforcement (`/api/budgets`)**: Define monthly expenditure targets per category. Full-bleed progress bars smoothly fill up and shift color state (`Vault Green` under budget → `Warning Amber` at >=85% → `Rust Red` when over 100% limit).
- **Command Center Dashboard (`/api/analytics/dashboard`)**: Answers *"How am I doing this month?"* in sub-3 seconds. Features a high-impact Net Worth hero banner in *Fraunces*, period cashflow breakdown, an interactive Recharts donut chart with category allocation percentage calculation, and recent ledger activity.
- **Auto-Recurring Engine (`/api/transactions/recurring/check`)**: Schedule recurring bills or regular deposits (`Weekly` every 7 days or `Monthly` every 1 month). The background engine automatically evaluates due dates and spawns new transaction entries without duplicate generation.
- **Longitudinal Trend Analytics (`/api/analytics/history`)**: Audit historical multi-month inflow vs. outflow velocity using interactive Recharts bar charts and an efficiency ratio audit grid.
- **Restrained Motion & UI System**: Custom cubic-bezier numerical counters (`AnimatedCurrency`), subtle skeleton loaders matching exact design tokens, and intentional empty states (`EmptyState`) with actionable triggers.

---

## Technical Specifications & Stack

- **Frontend Environment**: React 19 + Vite (`v8`), Tailwind CSS v3 with locked CSS custom variables & design token configuration, `react-router-dom` v6, `recharts`.
- **Backend API Engine**: Node.js + Express 4, Prisma ORM, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `cors`.
- **Relational Storage**: Relational SQL database managed via Prisma ORM (`schema.prisma`). Configured with **SQLite (`dev.db`)** for immediate zero-friction local execution and automated testing, cleanly swappable to **PostgreSQL** (`provider = "postgresql"`) in production deployments.
- **Quality Assurance**: Comprehensive backend automated integration test suite built with **Vitest** (`tests/api.test.js`) verifying auth registration, login sessions, account balances, transaction filtering, and budget limits.

---

## Quickstart & Setup Guide

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm** (v10+ recommended)

### 1. Clone Repository
```bash
git clone https://github.com/prakharrai12/COFFER.git
cd COFFER
```

### 2. Backend Initialization (`/backend`)
Open your first terminal window to initialize the database and start the API server:
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Run database schema migration (creates dev.db and Prisma client)
npx prisma migrate dev --name init

# Start local backend API dev server on port 5000
npm run dev
```
The backend server will run on **`http://localhost:5000`** with CORS configured for frontend connections.

### 3. Frontend Initialization (`/frontend`)
Open a second terminal window to run the Vite UI dev server:
```bash
cd frontend
npm install

# Start Vite dev server on port 5173
npm run dev
```
Open your browser to **`http://localhost:5173`** to access the COFFER Command Center.

---

## Production Verification & Testing

### Running the Backend Automated Test Suite
Ensure the backend logic and database operations are 100% verified:
```bash
cd backend
npm test
```
*Vitest will execute all 13 integration tests covering registration, authentication, token rotation, CRUD operations, budget calculations, and recurring transaction generation.*

### Building the Production UI Bundle
To verify zero compilation or syntax anomalies in the frontend build:
```bash
cd frontend
npm run build
```
*Vite will compile and optimize the client environment into `frontend/dist/` with code-split JavaScript and CSS assets.*

---

## Architectural Commit Roadmap Summary

COFFER was engineered through a strict sequential 17-commit methodology:
1. `chore: initialize project repository and structure`
2. `feat(backend): set up express server, prisma sqlite schema, and basic error handling`
3. `feat(backend): implement auth controller with register, login, refresh, and password reset`
4. `feat(backend): implement accounts controller with running balances`
5. `feat(backend): implement categories controller with default seeding and reassignment`
6. `feat(backend): implement transactions controller with full crud, filtering, and running balance updates`
7. `feat(backend): implement budgets controller and dashboard analytics aggregations`
8. `feat(backend): implement recurring transactions auto-generator engine`
9. `test(backend): implement automated test suite with vitest covering auth, accounts, and transactions`
10. `feat(frontend): initialize vite react project, tailwind css with design tokens and typography`
11. `feat(frontend): implement auth context, api client and auth screens`
12. `feat(frontend): build precision ui motion components, skeletons and empty states`
13. `feat(frontend): build dashboard screen with fraunces net worth banner and recharts donut`
14. `feat(frontend): build transactions ledger page with multi-filter bar and transaction modal`
15. `feat(frontend): build budgets and category vault pages with safe deletion modal`
16. `feat(frontend): build reports trend chart and settings account manager pages`
17. `docs: finalize readme documentation, run end-to-end verification, and push final release`

---

## Design System & Token Hierarchy

| Token Category | Token Variable | Exact Hex Value | Usage / Description |
| :--- | :--- | :--- | :--- |
| **Canvas & Surfaces** | `--canvas` | `#F7F5F0` | Warm paper background for high readability |
| | `--surface` | `#FFFFFF` | Card & modal containers |
| | `--surface-raised` | `#F0EDE6` | Table header backgrounds & category tags |
| **Typography & Ink** | `--ink` | `#141614` | Primary high-contrast charcoal text |
| | `--ink-muted` | `#6C706C` | Supporting labels, table headers, and hints |
| **Brand & Telemetry** | `--brand` | `#1F5F4D` | Vault Green primary buttons & safe budgets |
| | `--brand-light` | `#2D8A70` | Hover accents & charts |
| | `--positive` | `#1B7340` | Income credits & surplus cashflow |
| | `--negative` | `#B03020` | Expense debits, alerts & budget violations |
| | `--warning` | `#B8863B` | Near-limit (>=85%) budget status |
| **Borders** | `--border` | `#E3E0D8` | Structural dividers & input contours |

---
*COFFER v1.0 • Built for financial precision and speed.*
