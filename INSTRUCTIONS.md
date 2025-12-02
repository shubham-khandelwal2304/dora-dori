# How to Start the Dora Dori AI Application

## Problem: Master Table showing "Internal Server Error"

**Cause:** The backend API server is not running.

## Solution: Start the Backend Server

### Option 1: Double-Click the Batch File (Easiest)

1. Navigate to: `C:\Users\swind\Downloads\dora-dori-vista-main\dora-dori-vista-main\`
2. Double-click: **`START_EVERYTHING.bat`**
3. Two command windows will open:
   - Backend Server (Port 4000)
   - Frontend Server (Port 8080)
4. Wait 5-10 seconds for both to start
5. Open browser to: http://localhost:8080/master-table

### Option 2: Start Backend Only (if frontend is already running)

1. Navigate to: `C:\Users\swind\Downloads\dora-dori-vista-main\dora-dori-vista-main\`
2. Double-click: **`START_BACKEND_SERVER.bat`**
3. You should see:
   ```
   Connecting to database...
   Using database URL: postgresql://postgres:****@db.gmjgjwtkbpctpapxdury.supabase.co:5432/postgres
   Server running on http://localhost:4000
   Database connected successfully
   ```
4. Keep this window open
5. Refresh your browser

### Option 3: Manual Start (Command Line)

Open Command Prompt and run:

```cmd
cd C:\Users\swind\Downloads\dora-dori-vista-main\dora-dori-vista-main
node server/index.js
```

Keep this window open while using the application.

## Verify Backend is Running

Open browser to: http://localhost:4000/health

You should see: `{"status":"ok"}`

## Still Not Working?

### Check if port 4000 is already in use:

```cmd
netstat -ano | findstr :4000
```

If you see results, another program is using port 4000. Either:
1. Close that program
2. Or change the port in `.env.local`:
   ```
   PORT=5000
   ```
   Then update `vite.config.js` proxy to use 5000

### Check Environment Variables

Make sure `.env.local` exists in the project root with:
```
DATABASE_URL=postgresql://postgres:excollo123excollo@db.gmjgjwtkbpctpapxdury.supabase.co:5432/postgres
PORT=4000
MASTER_TABLE_NAME=inventory_data
```

## Architecture

```
Frontend (React + Vite)     Backend (Express API)      Database (Supabase)
Port 8080                   Port 4000                  PostgreSQL
├─ UI Components            ├─ /api/master-table       └─ inventory_data table
└─ Fetches from /api/...    └─ Connects to DB
```

Both need to be running simultaneously!

