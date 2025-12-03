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
      SELECT category,
        CASE WHEN SUM(one_month_total_sales) = 0 THEN 0 ELSE
          ROUND(100.0 * SUM(total_return_units) / NULLIF(SUM(one_month_total_sales), 0), 1)
        END AS return_rate_pct
      FROM ${tableName} GROUP BY category ORDER BY return_rate_pct DESC;
    `;

    const { rows } = await pool.query(query);

    return res.json(
      rows.map((r) => ({
        category: r.category,
        returnRatePct: Number(r.return_rate_pct) || 0,
      })),
    );
  } catch (error) {
    console.error('Error running return rate by category query:', error.message);
    return res.status(500).json({ error: 'Failed to fetch return rate by category data' });
  }
}


