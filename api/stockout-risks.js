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

    return res.json(
      rows.map((r) => ({
        styleId: r.style_id,
        styleName: r.style_name,
        daysOfCover: Number(r.total_days_of_cover) || 0,
        atsPooled: Number(r.ats_pooled) || 0,
        dailySales: Number(r.daily_total_sales) || 0,
      })),
    );
  } catch (error) {
    console.error('Error running stockout risks query:', error.message);
    return res.status(500).json({ error: 'Failed to fetch stockout risks' });
  }
}


