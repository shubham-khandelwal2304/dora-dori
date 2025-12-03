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
      SELECT style_id, style_name,
        CASE WHEN one_month_sales_myntra >= one_month_sales_nykaa THEN 'Myntra' ELSE 'Nykaa' END AS primary_platform,
        one_month_total_sales AS one_month_sales_units
      FROM ${tableName}
      WHERE one_month_total_sales > 0 AND ats_pooled > 0
      ORDER BY one_month_total_sales DESC
      LIMIT 5;
    `;

    const { rows } = await pool.query(query);

    return res.json(
      rows.map((r) => ({
        styleId: r.style_id,
        styleName: r.style_name,
        primaryPlatform: r.primary_platform,
        oneMonthSalesUnits: Number(r.one_month_sales_units) || 0,
      })),
    );
  } catch (error) {
    console.error('Error running top SKUs query:', error.message);
    return res.status(500).json({ error: 'Failed to fetch top SKUs' });
  }
}


