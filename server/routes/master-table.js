import express from 'express';
import pool from '../lib/db.js';

const router = express.Router();

const tableName = process.env.MASTER_TABLE_NAME || 'inventory_data';
const viewName = process.env.MASTER_VIEW_NAME || tableName;

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

    // Main query - return ALL columns and ALL matching rows
    const dataQuery = `
      SELECT *
      FROM ${viewName}
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

// PUT /api/master-table/:styleId
router.put('/master-table/:styleId', async (req, res) => {
  const { styleId } = req.params;
  const updates = req.body || {};

  if (!styleId) {
    return res.status(400).json({ error: 'style_id is required in URL' });
  }

  // ✅ Primary editable columns (except style_id)
  const editableColumns = [
    'style_name',
    'category',
    'launch_date',
    'color',
    'fabric_type',
    'fabric_type_2',
    'fabric_type_3',
    'fabric_available_mtr',
    'fabric_available_mtr_2',
    'fabric_available_mtr_3',
    'fabric_yield_per_unit',
    'fabric_yield_per_unit_1',
    'fabric_yield_per_unit_2',
    'fabric_yield_per_unit_3',
    'listed_myntra',
    'listed_nykaa',
    'listed_quantity',
    'ats_pooled',
    'ats_myntra',
    'ats_nykaa',
    'one_month_total_sales',
    'one_month_sales_myntra',
    'one_month_sales_nykaa',
    'mrp',
    'price_myntra',
    'price_nykaa',
    'discount_percent_myntra',
    'discount_percent_nykaa',
    'total_return_units',
    'return_units_myntra',
    'return_units_nykaa',
    'return_average_percent',
    'completed_qty',
    'size_list_myntra',
    'size_list_nykaa',
    'myntra_qty_s',
    'myntra_qty_m',
    'myntra_qty_l',
    'myntra_qty_xl',
    'nykaa_qty_s',
    'nykaa_qty_m',
    'nykaa_qty_l',
    'nykaa_qty_xl',
    'myntra_sold_s',
    'myntra_sold_m',
    'myntra_sold_l',
    'myntra_sold_xl',
    'nykaa_sold_s',
    'nykaa_sold_m',
    'nykaa_sold_l',
    'nykaa_sold_xl',
    'ads_platform',
    'clicks',
    'impressions',
    'ad_spend',
    'total_orders_sold_myntra',
    'total_orders_sold_nykaa',
  ];

  // ❌ Derived columns (never update from API)
  const derivedColumns = new Set([
    'style_id',
    'daily_sales_myntra',
    'daily_sales_nykaa',
    'daily_total_sales',
    'days_of_cover_myntra',
    'days_of_cover_nykaa',
    'total_days_of_cover',
    'sell_through_myntra',
    'sell_through_nykaa',
    'total_sell_through',
    'broken_size_myntra',
    'broken_size_nykaa',
    'fabric_consumed_meters',
    'fabric_consumed_meters_1',
    'fabric_consumed_meters_2',
    'fabric_consumed_meters_3',
    'fabric_remaining_meters_1',
    'fabric_remaining_meters_2',
    'fabric_remaining_meters_3',
    'units_possible_from_fabric',
    'revenue_myntra',
    'revenue_nykaa',
    'total_revenue',
    'roas',
    'contribution_margin_overall',
    'contribution_margin_myntra',
    'contribution_margin_nykaa',
    'size_contribution_myntra_s',
    'size_contribution_myntra_m',
    'size_contribution_myntra_l',
    'size_contribution_myntra_xl',
    'size_contribution_nykaa_s',
    'size_contribution_nykaa_m',
    'size_contribution_nykaa_l',
  ]);

  // Build SET clause only with allowed fields
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

  // style_id goes last in WHERE
  values.push(styleId);

  // 1. UPDATE the TABLE
  const updateQuery = `
    UPDATE ${tableName}
    SET ${setParts.join(', ')}
    WHERE style_id = $${index}
    RETURNING style_id;
  `;

  try {
    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Style not found' });
    }

    // 2. FETCH result from the VIEW
    const viewQuery = `SELECT * FROM ${viewName} WHERE style_id = $1`;
    const viewResult = await pool.query(viewQuery, [styleId]);

    // Return the calculated row from the view
    return res.json({ row: viewResult.rows[0] });

  } catch (err) {
    console.error('Error updating style:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
