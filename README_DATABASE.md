# Database Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory (`dora-dori-vista-main/`) with the following:

```env
DATABASE_URL=postgresql://postgres:excollo123excollo@db.gmjgjwtkbpctpapxdury.supabase.co:5432/postgres
PORT=3001
MASTER_TABLE_NAME=master_inventory_view
```

**Note:** Replace `master_inventory_view` with your actual table or view name if different.

## Database Schema Requirements

The API expects a table or view with the following columns (or similar variations):

### Required Columns:
- `style_id` (text/varchar)
- `style_name` (text/varchar)
- `category` (text/varchar)
- `ats_pooled` (numeric/integer)
- `daily_total_sales` or `daily_sales_myntra` (numeric)
- `total_days_of_cover` or `days_of_cover_myntra` (numeric/integer)
- `total_sell_through` or `sell_through_pct` (numeric)
- `contribution_margin_overall` or `margin_pct` (numeric)
- `roas` (numeric)
- `return_average_percent` or `return_pct` (numeric)
- `listed_myntra` (boolean)
- `listed_nykaa` (boolean)
- `broken_size_myntra` (integer)
- `broken_size_nykaa` (integer)
- `fabric_type` (text/varchar)
- `fabric_remaining_meters` or `fabric_available_mtr` (numeric)
- `units_possible_from_fabric` or `units_possible` (integer)
- `launch_date` (date/timestamp)
- `one_month_total_sales` (integer)
- `mrp` (numeric)
- `price_myntra` (numeric)
- `price_nykaa` (numeric)

The API uses `COALESCE` to handle column name variations, so if your schema uses different names, you may need to adjust the query in `server/routes/master-table.js`.

## Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your `DATABASE_URL` and adjust `MASTER_TABLE_NAME` if needed

3. **Run both frontend and backend:**
   ```bash
   npm run dev:all
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Backend API server
   npm run dev:server

   # Terminal 2 - Frontend Vite dev server
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

## Testing the API

You can test the API endpoint directly:

```bash
# Get all data (first page)
curl http://localhost:3001/api/master-table

# Search for a style
curl "http://localhost:3001/api/master-table?search=Blue"

# Get specific page
curl "http://localhost:3001/api/master-table?page=2&page_size=10"
```

## Troubleshooting

### Database Connection Issues

1. **Check your DATABASE_URL format:**
   ```
   postgresql://username:password@host:port/database
   ```

2. **Verify SSL settings:** Supabase requires SSL, which is already configured in `server/lib/db.js`

3. **Check table/view name:** Make sure `MASTER_TABLE_NAME` matches your actual table or view name

### API Errors

- Check server console for detailed error messages
- Verify all required columns exist in your database
- Ensure column data types match expected types (numeric, text, boolean, date)

### Frontend Not Loading Data

- Ensure backend server is running on port 3001
- Check browser console for API errors
- Verify Vite proxy configuration in `vite.config.js`

