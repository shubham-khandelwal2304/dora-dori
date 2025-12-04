import pool, { getTableName } from './_db.js';

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
      SELECT
        COUNT(DISTINCT style_id) FILTER (WHERE ats_pooled > 0 OR one_month_total_sales > 0) AS total_active_styles,
        COUNT(*) FILTER (WHERE total_days_of_cover < 30) AS styles_at_risk_count,
        COALESCE(SUM(total_revenue), 0) AS revenue_last_30d,
        AVG(return_average_percent) FILTER (WHERE one_month_total_sales > 0) AS avg_return_rate_pct
      FROM ${tableName}
      WHERE ats_pooled > 0 OR one_month_total_sales > 0;
    `;

    const { rows } = await pool.query(query);
    const row = rows[0] || {};

    return res.json({
      totalActiveStyles: Number(row.total_active_styles) || 0,
      totalActiveStylesChange: '+0',
      stylesAtRiskCount: Number(row.styles_at_risk_count) || 0,
      stylesAtRiskChange: '+0',
      revenueLast30d: Number(row.revenue_last_30d) || 0,
      revenueLast30dChange: '+0',
      averageReturnRate: Number(row.avg_return_rate_pct) || 0,
      averageReturnRateChange: '+0%',
    });
  } catch (error) {
    console.error('Error running KPI query:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch KPI data',
      details: error.message || String(error),
    });
  }
}


