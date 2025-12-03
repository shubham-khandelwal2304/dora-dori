import pool, { getTableName } from '../_db.js';

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const tableName = getTableName();

  try {
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

    return res.json(
      rows.map((r) => ({
        adsPlatform: r.ads_platform,
        totalAdSpend: Number(r.total_ad_spend) || 0,
        totalClicks: Number(r.total_clicks) || 0,
        globalAov: Number(r.global_aov) || 0,
        assumedCvr: Number(r.assumed_cvr) || 0,
        estimatedOrders: Number(r.estimated_orders) || 0,
        revenue30d: Number(r.estimated_revenue) || 0,
        roasX: r.estimated_roas_x !== null ? Number(r.estimated_roas_x) : null,
      })),
    );
  } catch (error) {
    console.error('Error running channel performance query:', error.message);
    return res.status(500).json({ error: 'Failed to fetch channel performance data' });
  }
}


