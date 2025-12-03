## Dora Dori Inventory & Performance Dashboard

A modern React + Vite dashboard for merchandising, inventory, and marketing performance analytics.  
It connects to a Postgres database and exposes KPIs and trend data via an Express API (for local/dev) and a serverless API handler (for deployment).

---

## Features

- **Executive dashboard**: Top-level KPIs for active styles, styles at risk, revenue, and average return rate.
- **Top performers**: Highlights best‑selling SKUs and primary sales channels (e.g. Myntra vs Nykaa).
- **Stockout risk detection**: Surfaces high‑velocity styles with low days of cover and low ATS.
- **Trends & charts**:
  - **Units vs. return rate** over time.
  - **Fabric availability vs. 30‑day usage**.
  - **Channel performance**: ad spend, clicks, estimated revenue, ROAS.
  - **Return rate by category**.
- **Master table**: Tabular view over the main inventory dataset.
- **Chat assistant**: Embedded chatbot component for guided exploration and explanations.

---

## Tech Stack

- **Frontend**
  - React 18 + Vite
  - React Router
  - Tailwind CSS + `tailwindcss-animate`
  - shadcn‑style UI primitives (Radix UI, custom `ui/*` components)
  - Recharts for data visualisation
- **Backend / API**
  - Express (local/dev server under `server/`)
  - Vercel‑style serverless API (`api/index.js`)
  - `pg` for Postgres access
- **Tooling**
  - ESLint
  - PostCSS + Autoprefixer
  - `concurrently` for running backend and frontend together

---

## Prerequisites

- **Node.js** 18+ (recommended)  
- **npm** (comes with Node)  
- **PostgreSQL** instance with:
  - A database accessible via a `DATABASE_URL` connection string.
  - A table or view matching the expected schema (default name `inventory_data`, configurable via `MASTER_TABLE_NAME`).

---

## Environment Variables

Create a `.env.local` file in the project root (same folder as `package.json`).  
You can also use `.env` for shared defaults; `.env.local` is loaded first in local/dev.

Minimum configuration:

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
MASTER_TABLE_NAME=inventory_data        # or your table/view name
PORT=4000                               # optional, Express server port (default 4000)
```

You can verify connectivity and table presence using the test script (see below).

---

## Installation

From the project root:

```bash
npm install
```

This will install both frontend and backend dependencies defined in `package.json`.

---

## Running the App in Development

### 1. Start only the frontend (Vite)

```bash
npm run dev
```

This starts the React app on the default Vite port (typically `http://localhost:5173`).

> Use this if you are pointing the frontend to a remote/hosted API.

### 2. Start only the Express backend

```bash
npm run dev:server
```

This starts the Express API on `http://localhost:4000` (or `PORT` from env).

Key routes (behind the `/api` prefix):

- `GET /health` – basic health check.
- `GET /api/kpis` – top‑level KPI metrics.
- `GET /api/top-skus` – top‑performing SKUs.
- `GET /api/stockout-risks` – high stockout‑risk styles.
- `GET /api/trends/units-vs-returns`
- `GET /api/trends/fabric-usage`
- `GET /api/trends/channel-performance`
- `GET /api/trends/return-rate-by-category`
- `GET /api/master-table` – main inventory table (limited rows for UI).

### 3. Start frontend and backend together

```bash
npm run dev:all
```

This uses `concurrently` to run both `npm run dev:server` and `npm run dev` at the same time, providing a full local experience.

---

## Testing the Database Connection

Before running the full app, you can validate Postgres connectivity and schema:

```bash
npm run test:db
```

This will:

- Connect to the database defined in `DATABASE_URL`.
- Print available tables and views in the `public` schema.
- Check for the table/view named by `MASTER_TABLE_NAME` (default `master_inventory_view` in the test script).
- Print the columns and run a simple `COUNT(*)` query.

If the expected table/view is not found, update `MASTER_TABLE_NAME` in `.env.local` to one of the listed names.

---

## Production / Deployment Notes

- The project includes:
  - `api/index.js` – a serverless API handler suitable for platforms like Vercel.
  - `vercel.json` – basic routing/build configuration.
- For deployments using the serverless handler:
  - Ensure `DATABASE_URL` and `MASTER_TABLE_NAME` are set as environment variables in your hosting provider.
  - The main build command is:

    ```bash
    npm run vercel-build
    ```

  - The frontend will be served as a static build, while API routes are served from the `api` directory.

---

## Building and Previewing Locally

Create a production build:

```bash
npm run build
```

Preview the built app locally:

```bash
npm run preview
```

This serves the contents of the `dist` directory on a local port (printed in the console).

---

## Project Structure (High Level)

```text
api/                 # Serverless API handler (for deployment)
server/              # Express server, routes, and DB utilities (local/dev)
src/
  components/        # Reusable UI and dashboard components
  components/ui/     # shadcn-style UI primitives (buttons, cards, dialogs, etc.)
  hooks/             # React hooks (e.g. mobile detection, toast)
  pages/             # Route-level pages (Index, Insights, MasterTable, NotFound)
  main.jsx           # React entrypoint
  App.jsx            # Top-level app and routing
public/              # Static assets (favicons, placeholders, robots.txt)
dist/                # Build output (generated)
```

---

## Useful npm Scripts

- **`npm run dev`** – Start Vite dev server for the React app.
- **`npm run dev:server`** – Start the Express API server.
- **`npm run dev:all`** – Run both frontend and backend together.
- **`npm run test:db`** – Test Postgres connection and table configuration.
- **`npm run build`** – Production build of the frontend.
- **`npm run vercel-build`** – Build for Vercel (same as `build`).
- **`npm run preview`** – Preview the built app locally.
- **`npm run lint`** – Run ESLint on the codebase.

---

## Troubleshooting

- **`DATABASE_URL not found in environment variables`**  
  Ensure `.env.local` (or `.env`) exists at the project root and includes a valid `DATABASE_URL`. Re‑run `npm run test:db` afterwards.

- **No data returned / empty charts**  
  Confirm that:
  - `MASTER_TABLE_NAME` points to a table/view with data.
  - The table columns (e.g. `style_id`, `ats_pooled`, `one_month_total_sales`, `return_average_percent`, etc.) exist and are populated.

- **CORS errors in the browser**  
  When using the Express server locally, make sure the frontend points to `http://localhost:4000/api` and that `cors` is enabled (already configured in `server/index.js`).

If you run into issues not covered here, check the server logs (for `npm run dev:server` or deployment logs) for SQL or connection errors.


