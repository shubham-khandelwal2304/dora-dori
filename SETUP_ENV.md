# Environment Setup Instructions

## Create .env.local file

Create a file named `.env.local` in the `dora-dori-vista-main/` directory with the following content:

```env
DATABASE_URL=postgresql://postgres:excollo123excollo@db.gmjgjwtkbpctpapxdury.supabase.co:5432/postgres
PORT=3001
MASTER_TABLE_NAME=master_inventory_view
```

**Important Notes:**
- Replace `master_inventory_view` with your actual table or view name if it's different
- The `.env.local` file should be in the same directory as `package.json`
- Never commit this file to git (it should be in `.gitignore`)

## Common Table Names

If `master_inventory_view` doesn't exist, try these common alternatives:
- `inventory_data`
- `master_data`
- `styles`
- `inventory`

Update `MASTER_TABLE_NAME` in `.env.local` accordingly.

## Verify Your Table Name

To find your table name in Supabase:
1. Go to your Supabase project
2. Navigate to Table Editor
3. Look for the table that contains your inventory data
4. Use that exact table name (case-sensitive) in `MASTER_TABLE_NAME`

