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
    const query = `SELECT * FROM ${tableName} ORDER BY style_id LIMIT 100;`;
    const { rows } = await pool.query(query);
    return res.json({ data: rows, total: rows.length });
  } catch (error) {
    console.error('Error running master table query:', error.message);
    return res.status(500).json({ error: 'Failed to fetch master table data' });
  }
}


