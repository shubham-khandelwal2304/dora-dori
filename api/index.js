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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

    // KPIs endpoint
    if (path === '/kpis') {
      const query = `
        SELECT
          COUNT(DISTINCT style_id) FILTER (WHERE ats_pooled > 0 OR one_month_total_sales > 0) AS total_active_styles,
          COUNT(*) FILTER (WHERE total_days_of_cover < 15) AS styles_at_risk_count,
          COALESCE(SUM(total_revenue), 0) AS revenue_last_30d,
          AVG(return_average_percent) FILTER (WHERE one_month_total_sales > 0) AS avg_return_rate_pct
        FROM ${tableName}
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

    // Top SKUs endpoint
    if (path === '/top-skus') {
      const query = `
        SELECT style_id, style_name,
          CASE WHEN one_month_sales_myntra >= one_month_sales_nykaa THEN 'Myntra' ELSE 'Nykaa' END AS primary_platform,
          one_month_total_sales AS one_month_sales_units
        FROM ${tableName}
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

    // Stockout risks endpoint
    if (path === '/stockout-risks') {
      const query = `
        WITH sales_stats AS (
          SELECT AVG(daily_total_sales) AS avg_daily_sales FROM ${tableName} WHERE daily_total_sales > 0
        )
        SELECT i.style_id, i.style_name, i.total_days_of_cover, i.ats_pooled, i.daily_total_sales
        FROM ${tableName} i, sales_stats s
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

    // Channel Performance endpoint
    if (path === '/trends/channel-performance') {
      const query = `
        WITH global_aov AS (
          SELECT CASE WHEN SUM(one_month_total_sales) = 0 THEN 0 ELSE
            SUM(COALESCE(one_month_sales_myntra, 0) * COALESCE(price_myntra, 0) +
                COALESCE(one_month_sales_nykaa, 0) * COALESCE(price_nykaa, 0)) / SUM(one_month_total_sales)
          END AS aov FROM ${tableName}
        ),
        platform_agg AS (
          SELECT ads_platform, SUM(ad_spend) AS total_ad_spend, SUM(clicks) AS total_clicks
          FROM ${tableName} WHERE ad_spend IS NOT NULL GROUP BY ads_platform
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

    // Return Rate by Category endpoint
    if (path === '/trends/return-rate-by-category') {
      const query = `
        SELECT category,
          CASE WHEN SUM(one_month_total_sales) = 0 THEN 0 ELSE
            ROUND(100.0 * SUM(total_return_units) / NULLIF(SUM(one_month_total_sales), 0), 1)
          END AS return_rate_pct
        FROM ${tableName} GROUP BY category ORDER BY return_rate_pct DESC;
      `;
      const { rows } = await pool.query(query);
      return res.json(rows.map(r => ({
        category: r.category,
        returnRatePct: Number(r.return_rate_pct) || 0,
      })));
    }

    // Master Table endpoint
    if (path === '/master-table' || path.startsWith('/master-table')) {
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
