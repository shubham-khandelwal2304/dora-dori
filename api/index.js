import pg from 'pg';

const { Pool } = pg;

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const getTableName = () => process.env.MASTER_TABLE_NAME || 'inventory_data';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  const path = url.replace('/api', '');
  const tableName = getTableName();

  try {
    // Health check
    if (path === '' || path === '/') {
      return res.json({ status: 'API is running', timestamp: new Date().toISOString() });
    }

    // ... (keep intermediate routes like /kpis, /top-skus, etc. if not replacing whole file) ...

    // Master Table endpoint
    if (path === '/master-table' || path.startsWith('/master-table/')) {
      // Check for PUT /master-table/:styleId
      // Vercel/Next serverless might pass query params automatically, or we parse path
      const idMatch = path.match(/^\/master-table\/([^\/]+)$/);
      
/*
      if ((idMatch || req.query.styleId) && req.method === 'PUT') {
        let styleId = req.query.styleId;
        if (!styleId && idMatch) {
            styleId = decodeURIComponent(idMatch[1]);
        }
        // Fallback to body if URL extraction failed but body has it
        if (!styleId && req.body && req.body.style_id) {
            styleId = req.body.style_id;
        }

        // 🧹 SANITIZATION: Remove any query params that Vercel might have attached (e.g. ?path=...)
        if (styleId && styleId.includes('?')) {
          styleId = styleId.split('?')[0];
        }

        if (styleId) styleId = styleId.trim();
        
        const updates = req.body || {};

        // ✅ Primary editable columns
        const editableColumns = [
          'style_name', 'category', 'launch_date', 'color', 'fabric_type', 'fabric_type_2', 'fabric_type_3',
          'fabric_available_mtr', 'fabric_available_mtr_2', 'fabric_available_mtr_3',
          'fabric_yield_per_unit', 'fabric_yield_per_unit_1', 'fabric_yield_per_unit_2', 'fabric_yield_per_unit_3',
          'listed_myntra', 'listed_nykaa', 'listed_quantity',
          'ats_pooled', 'ats_myntra', 'ats_nykaa',
          'one_month_total_sales', 'one_month_sales_myntra', 'one_month_sales_nykaa',
          'mrp', 'price_myntra', 'price_nykaa',
          'discount_percent_myntra', 'discount_percent_nykaa',
          'total_return_units', 'return_units_myntra', 'return_units_nykaa', 'return_average_percent',
          'completed_qty', 'size_list_myntra', 'size_list_nykaa',
          'myntra_qty_s', 'myntra_qty_m', 'myntra_qty_l', 'myntra_qty_xl',
          'nykaa_qty_s', 'nykaa_qty_m', 'nykaa_qty_l', 'nykaa_qty_xl',
          'myntra_sold_s', 'myntra_sold_m', 'myntra_sold_l', 'myntra_sold_xl',
          'nykaa_sold_s', 'nykaa_sold_m', 'nykaa_sold_l', 'nykaa_sold_xl',
          'ads_platform', 'clicks', 'impressions', 'ad_spend',
          'total_orders_sold_myntra', 'total_orders_sold_nykaa',
        ];

        // ❌ Derived columns
        const derivedColumns = new Set([
          'style_id', 'daily_sales_myntra', 'daily_sales_nykaa', 'daily_total_sales',
          'days_of_cover_myntra', 'days_of_cover_nykaa', 'total_days_of_cover',
          'sell_through_myntra', 'sell_through_nykaa', 'total_sell_through',
          'broken_size_myntra', 'broken_size_nykaa',
          'fabric_consumed_meters', 'fabric_consumed_meters_1', 'fabric_consumed_meters_2', 'fabric_consumed_meters_3',
          'fabric_remaining_meters_1', 'fabric_remaining_meters_2', 'fabric_remaining_meters_3',
          'units_possible_from_fabric',
          'revenue_myntra', 'revenue_nykaa', 'total_revenue',
          'roas', 'contribution_margin_overall', 'contribution_margin_myntra', 'contribution_margin_nykaa',
          'size_contribution_myntra_s', 'size_contribution_myntra_m', 'size_contribution_myntra_l', 'size_contribution_myntra_xl',
          'size_contribution_nykaa_s', 'size_contribution_nykaa_m', 'size_contribution_nykaa_l',
        ]);

        const setParts = [];
        const values = [];
        let index = 1;

        for (const col of editableColumns) {
          if (updates[col] !== undefined && !derivedColumns.has(col)) {
            setParts.push(`${col} = $${index}`);
            values.push(updates[col]);
            index++;
          }
        }

        if (setParts.length === 0) {
          return res.status(400).json({ error: 'No valid editable fields provided' });
        }

        values.push(styleId);
        // Use TRIM to ensure whitespace doesn't prevent matching
        const query = `
          UPDATE ${tableName}
          SET ${setParts.join(', ')}
          WHERE LOWER(TRIM(style_id)) = LOWER(TRIM($${index}))
          RETURNING *;
        `;

        try {
          const result = await pool.query(query, values);
          if (result.rows.length === 0) {
            // DIAGNOSTIC STEP: Check what IDs actually exist
            let availableIds = [];
            try {
              const checkQuery = `SELECT style_id FROM ${tableName} LIMIT 5`;
              const checkResult = await pool.query(checkQuery);
              availableIds = checkResult.rows.map(r => r.style_id);
            } catch (e) {
              console.error('Diagnostic query failed:', e);
            }

            return res.status(404).json({ 
              error: 'Style not found', 
              debug: { 
                receivedStyleId: styleId, 
                tableName: tableName,
                envMasterTableName: process.env.MASTER_TABLE_NAME || '(not set)',
                message: "Update returned 0 rows. See available_ids to verify table content.",
                query: query.trim(),
                available_ids_sample: availableIds
              } 
            });
          }
          return res.json({ row: result.rows[0] });
        } catch (err) {
          console.error('Error updating style:', err);
          return res.status(500).json({ error: 'Internal server error', details: err.message });
        }
      }
*/

      // GET logic (unchanged fallback)
      const query = `SELECT * FROM ${tableName} ORDER BY style_id LIMIT 100;`;
      const { rows } = await pool.query(query);
      return res.json({ data: rows, total: rows.length });
    }

    // Not found
    return res.status(404).json({ error: 'Endpoint not found', path });

  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
