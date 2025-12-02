import express from 'express';
import pool from '../lib/db.js';

const router = express.Router();

// GET /api/master-table
// Returns ALL matching rows (no pagination) so the frontend can show
// the full dataset on a single page.
router.get('/master-table', async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Build the WHERE clause for search
    let whereClause = '';
    const queryParams = [];

    if (search && search.trim() !== '') {
      whereClause = `WHERE (
        style_name ILIKE $1 OR 
        style_id ILIKE $1 OR 
        category ILIKE $1
      )`;
      queryParams.push(`%${search.trim()}%`);
    }

    // Table/view name - use environment variable or default
    const tableName = process.env.MASTER_TABLE_NAME || 'inventory_data';

    // Main query - return ALL columns and ALL matching rows
    const dataQuery = `
      SELECT *
      FROM ${tableName}
      ${whereClause}
      ORDER BY style_id ASC
    `;

    const { rows } = await pool.query(dataQuery, queryParams);
    const total = rows.length;

    res.json({
      data: rows,
      pagination: {
        page: 1,
        page_size: total,
        total,
        total_pages: 1,
      },
    });
  } catch (error) {
    console.error('Error fetching master table:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    res.status(500).json({ 
      error: 'Failed to fetch master table',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

