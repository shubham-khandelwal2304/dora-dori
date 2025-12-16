import pg from 'pg';

const { Pool } = pg;

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper to determine the correct table/view names
const getWriteTableName = () => process.env.MASTER_TABLE_NAME || 'inventory_data';
// If VIEW name is not set, fallback to the table name (simple mode)
const getReadViewName = () => process.env.MASTER_VIEW_NAME || getWriteTableName();

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
  const tableName = getWriteTableName(); // For writing (and legacy read fallback)
  const viewName = getReadViewName();    // For reading

  try {
    // Health check
    if (path === '' || path === '/') {
      return res.json({ status: 'API is running', timestamp: new Date().toISOString() });
    }

    // KPIs endpoint - Read from View
    if (path === '/kpis') {
      const query = `
        SELECT
          COUNT(DISTINCT style_id) FILTER (WHERE ats_pooled > 0 OR one_month_total_sales > 0) AS total_active_styles,
          COUNT(*) FILTER (WHERE total_days_of_cover < 15) AS styles_at_risk_count,
          COALESCE(SUM(total_revenue), 0) AS revenue_last_30d,
          AVG(return_average_percent) FILTER (WHERE one_month_total_sales > 0) AS avg_return_rate_pct
        FROM ${viewName}
        WHERE ats_pooled > 0 OR one_month_total_sales > 0;
      `;
      const { rows } = await pool.query(query);
      const row = rows[0] || {};
      return res.json({
        totalActiveStyles: Number(row.total_active_styles) || 0,
        totalActiveStylesChange: "+0",
        stylesAtRiskCount: Number(row.styles_at_risk_count) || 0,
        stylesAtRiskChange: "+0",
        revenueLast30d: Number(row.revenue_last_30d) || 0,
        revenueLast30dChange: "+0",
        averageReturnRate: Number(row.avg_return_rate_pct) || 0,
        averageReturnRateChange: "+0%",
      });
    }

    // Top SKUs endpoint - Read from View
    if (path === '/top-skus') {
      const query = `
        SELECT style_id, style_name,
          CASE WHEN one_month_sales_myntra >= one_month_sales_nykaa THEN 'Myntra' ELSE 'Nykaa' END AS primary_platform,
          one_month_total_sales AS one_month_sales_units
        FROM ${viewName}
        WHERE one_month_total_sales > 0 AND ats_pooled > 0
        ORDER BY one_month_total_sales DESC
        LIMIT 5;
      `;
      const { rows } = await pool.query(query);
      return res.json(rows.map(r => ({
        styleId: r.style_id,
        styleName: r.style_name,
        primaryPlatform: r.primary_platform,
        oneMonthSalesUnits: Number(r.one_month_sales_units) || 0,
      })));
    }

    // Stockout risks endpoint - Read from View
    if (path === '/stockout-risks') {
      const query = `
        WITH sales_stats AS (
          SELECT AVG(daily_total_sales) AS avg_daily_sales FROM ${viewName} WHERE daily_total_sales > 0
        )
        SELECT i.style_id, i.style_name, i.total_days_of_cover, i.ats_pooled, i.daily_total_sales
        FROM ${viewName} i, sales_stats s
        WHERE i.total_days_of_cover < 30 AND i.daily_total_sales > 0 AND i.daily_total_sales >= s.avg_daily_sales
        ORDER BY i.total_days_of_cover ASC, i.daily_total_sales DESC
        LIMIT 5;
      `;
      const { rows } = await pool.query(query);
      return res.json(rows.map(r => ({
        styleId: r.style_id,
        styleName: r.style_name,
        daysOfCover: Number(r.total_days_of_cover) || 0,
        atsPooled: Number(r.ats_pooled) || 0,
        dailySales: Number(r.daily_total_sales) || 0,
      })));
    }

    // Channel Performance endpoint - Read from View
    if (path === '/trends/channel-performance') {
      const query = `
        WITH global_aov AS (
          SELECT CASE WHEN SUM(one_month_total_sales) = 0 THEN 0 ELSE
            SUM(COALESCE(one_month_sales_myntra, 0) * COALESCE(price_myntra, 0) +
                COALESCE(one_month_sales_nykaa, 0) * COALESCE(price_nykaa, 0)) / SUM(one_month_total_sales)
          END AS aov FROM ${viewName}
        ),
        platform_agg AS (
          SELECT ads_platform, SUM(ad_spend) AS total_ad_spend, SUM(clicks) AS total_clicks
          FROM ${viewName} WHERE ad_spend IS NOT NULL GROUP BY ads_platform
        )
        SELECT p.ads_platform, p.total_ad_spend, p.total_clicks, ga.aov AS global_aov, 0.02::numeric AS assumed_cvr,
          (p.total_clicks * 0.02)::numeric AS estimated_orders, (p.total_clicks * 0.02 * ga.aov) AS estimated_revenue,
          CASE WHEN p.total_ad_spend = 0 THEN NULL ELSE (p.total_clicks * 0.02 * ga.aov) / p.total_ad_spend END AS estimated_roas_x
        FROM platform_agg p CROSS JOIN global_aov ga ORDER BY p.total_ad_spend DESC;
      `;
      const { rows } = await pool.query(query);
      return res.json(rows.map(r => ({
        adsPlatform: r.ads_platform,
        totalAdSpend: Number(r.total_ad_spend) || 0,
        totalClicks: Number(r.total_clicks) || 0,
        globalAov: Number(r.global_aov) || 0,
        assumedCvr: Number(r.assumed_cvr) || 0,
        estimatedOrders: Number(r.estimated_orders) || 0,
        revenue30d: Number(r.estimated_revenue) || 0,
        roasX: r.estimated_roas_x !== null ? Number(r.estimated_roas_x) : null,
      })));
    }

    // Return Rate by Category endpoint - Read from View
    if (path === '/trends/return-rate-by-category') {
      const query = `
        SELECT category,
          CASE WHEN SUM(one_month_total_sales) = 0 THEN 0 ELSE
            ROUND(100.0 * SUM(total_return_units) / NULLIF(SUM(one_month_total_sales), 0), 1)
          END AS return_rate_pct
        FROM ${viewName} GROUP BY category ORDER BY return_rate_pct DESC;
      `;
      const { rows } = await pool.query(query);
      return res.json(rows.map(r => ({
        category: r.category,
        returnRatePct: Number(r.return_rate_pct) || 0,
      })));
    }

    // Master Table endpoint
    if (path === '/master-table' || path.startsWith('/master-table/')) {
      // Check for PUT /master-table/:styleId
      // Vercel/Next serverless might pass query params automatically, or we parse path
      const idMatch = path.match(/^\/master-table\/([^\/]+)$/);
      
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
        // Use TRIM and LOWER for robust matching
        // 1. UPDATE the TABLE
        const query = `
          UPDATE ${tableName}
          SET ${setParts.join(', ')}
          WHERE LOWER(TRIM(style_id)) = LOWER(TRIM($${index}))
          RETURNING style_id;
        `;

        try {
          const result = await pool.query(query, values);
          if (result.rows.length === 0) {
            // DIAGNOSTIC STEP: Check what IDs actually exist IN THE WRITE TABLE
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
          
          // 2. FETCH result from the VIEW
          const viewQuery = `SELECT * FROM ${viewName} WHERE style_id = $1`;
          const viewResult = await pool.query(viewQuery, [styleId]);

          return res.json({ row: viewResult.rows[0] });
        } catch (err) {
          console.error('Error updating style:', err);
          return res.status(500).json({ error: 'Internal server error', details: err.message });
        }
      }

      // GET logic - READ from VIEW
      const query = `SELECT * FROM ${viewName} ORDER BY style_id LIMIT 100;`;
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
