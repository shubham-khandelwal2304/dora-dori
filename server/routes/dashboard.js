import express from 'express';
import pool from '../lib/db.js';

const router = express.Router();

const getTableName = () => process.env.MASTER_TABLE_NAME || 'inventory_data';

// 1–4) KPIs – aggregated in a single query
router.get('/kpis', async (req, res) => {
  const tableName = getTableName();

  try {
    const query = `
      SELECT
        -- KPI 1: Total Active Styles
        COUNT(DISTINCT style_id) FILTER (
          WHERE ats_pooled > 0 OR one_month_total_sales > 0
        ) AS total_active_styles,
        
        -- KPI 2: Styles at Risk Count (total_days_of_cover < 30)
        COUNT(*) FILTER (WHERE total_days_of_cover < 30) AS styles_at_risk_count,
        
        -- KPI 3: Revenue (Last 30 Days)
        COALESCE(SUM(total_revenue), 0) AS revenue_last_30d,
        
        -- KPI 4: Average Return Rate
        AVG(return_average_percent) FILTER (
          WHERE one_month_total_sales > 0
        ) AS avg_return_rate_pct
      FROM ${tableName}
      WHERE ats_pooled > 0 OR one_month_total_sales > 0;
    `;

    const { rows } = await pool.query(query);
    const row = rows[0] || {};

    res.json({
      totalActiveStyles: Number(row.total_active_styles) || 0,
      totalActiveStylesChange: "+0",
      stylesAtRiskCount: Number(row.styles_at_risk_count) || 0,
      stylesAtRiskChange: "+0",
      revenueLast30d: Number(row.revenue_last_30d) || 0,
      revenueLast30dChange: "+0",
      averageReturnRate: Number(row.avg_return_rate_pct) || 0,
      averageReturnRateChange: "+0%",
    });
  } catch (error) {
    console.error("Error running KPI query:", error.message);
    res.status(500).json({ error: "Failed to fetch KPI data" });
  }
});

// 5) Top Performing SKUs (sorted by 30‑day STR)
router.get('/top-skus', async (req, res) => {
  const tableName = getTableName();

  try {
    const query = `
      SELECT
        style_id,
        style_name,
        CASE
          WHEN one_month_sales_myntra >= one_month_sales_nykaa THEN 'Myntra'
          ELSE 'Nykaa'
        END AS primary_platform,
        one_month_total_sales AS one_month_sales_units
      FROM ${tableName}
      WHERE
        one_month_total_sales > 0
        AND ats_pooled > 0
      ORDER BY
        one_month_total_sales DESC
      LIMIT 5;
    `;

    const { rows } = await pool.query(query);
    res.json(
      rows.map((r) => ({
        styleId: r.style_id,
        styleName: r.style_name,
        primaryPlatform: r.primary_platform,
        oneMonthSalesUnits: Number(r.one_month_sales_units) || 0,
      }))
    );
  } catch (error) {
    console.error("Error running top SKUs query:", error.message);
    res.status(500).json({ error: "Failed to fetch top SKUs" });
  }
});

// 6) Top Stockout Risks – High risk styles with low days of cover and high sales velocity
router.get('/stockout-risks', async (req, res) => {
  const tableName = getTableName();

  try {
    const query = `
      WITH sales_stats AS (
        SELECT
          AVG(daily_total_sales) AS avg_daily_sales
        FROM ${tableName}
        WHERE daily_total_sales > 0
      )
      SELECT
        i.style_id,
        i.style_name,
        i.total_days_of_cover,
        i.ats_pooled,
        i.daily_total_sales
      FROM
        ${tableName} i,
        sales_stats s
      WHERE
        i.total_days_of_cover < 30              -- low cover
        AND i.daily_total_sales > 0
        AND i.daily_total_sales >= s.avg_daily_sales   -- high / above-avg sellers
      ORDER BY
        i.total_days_of_cover ASC,              -- highest stockout risk first
        i.daily_total_sales DESC
      LIMIT 5;
    `;

    const { rows } = await pool.query(query);
    res.json(
      rows.map((r) => ({
        styleId: r.style_id,
        styleName: r.style_name,
        daysOfCover: Number(r.total_days_of_cover) || 0,
        atsPooled: Number(r.ats_pooled) || 0,
        dailySales: Number(r.daily_total_sales) || 0,
      }))
    );
  } catch (error) {
    console.error("Error running stockout risks query:", error.message);
    res.status(500).json({ error: "Failed to fetch stockout risks" });
  }
});

// 7) Chart – Units Sold vs Return Rate (7 Days)
router.get('/trends/units-vs-returns', async (req, res) => {
  const tableName = getTableName();

  try {
    const query = `
      WITH agg AS (
        SELECT
          SUM(daily_total_sales) AS units_sold_per_day,
          -- overall return rate % = returned units / sold units
          CASE
            WHEN SUM(daily_total_sales) = 0 THEN 0
            ELSE
              SUM(daily_total_sales * (return_average_percent / 100.0))
              / SUM(daily_total_sales) * 100
          END AS return_rate_pct
        FROM ${tableName}
      )
      SELECT
        TO_CHAR(d::date, 'Dy') AS day_label,   -- Mon, Tue, ...
        agg.units_sold_per_day  AS units_sold,
        agg.return_rate_pct     AS return_rate_pct
      FROM agg,
           generate_series(CURRENT_DATE - 6, CURRENT_DATE, INTERVAL '1 day') AS d
      ORDER BY d;
    `;

    const { rows } = await pool.query(query);
    res.json(
      rows.map((r) => ({
        dayLabel: r.day_label,
        unitsSold: Math.round(Number(r.units_sold) || 0),
        returnRatePct: Number(r.return_rate_pct) || 0,
      }))
    );
  } catch (error) {
    console.error("Error running units vs returns query:", error.message);
    res.status(500).json({ error: "Failed to fetch units vs returns data" });
  }
});

// 8) Chart – Top Fabrics: Available vs 30-day Usage (meters)
router.get('/trends/fabric-usage', async (req, res) => {
  const tableName = getTableName();

  try {
    const query = `
      SELECT
        fabric_type,
        MAX(fabric_available_mtr) AS available_meters,
        SUM(one_month_total_sales * fabric_yield_per_unit) AS usage_30d_meters
      FROM ${tableName}
      GROUP BY fabric_type
      ORDER BY usage_30d_meters DESC      -- top fabrics by consumption
      LIMIT 4;                           -- show top 4 fabrics
    `;

    const { rows } = await pool.query(query);
    res.json(
      rows.map((r) => ({
        fabricType: r.fabric_type,
        availableMeters: Number(r.available_meters) || 0,
        usage30dMeters: Number(r.usage_30d_meters) || 0,
      }))
    );
  } catch (error) {
    console.error("Error running fabric usage query:", error.message);
    res.status(500).json({ error: "Failed to fetch fabric usage data" });
  }
});

// 9) Chart – Channel Performance: Ad Spend vs Revenue & ROAS
router.get('/trends/channel-performance', async (req, res) => {
  const tableName = getTableName();

  try {
    const query = `
      WITH global_aov AS (
        -- Global AOV ≈ total revenue / total units (last 30 days)
        SELECT
          CASE
            WHEN SUM(one_month_total_sales) = 0 THEN 0
            ELSE
              SUM(
                COALESCE(one_month_sales_myntra, 0) * COALESCE(price_myntra, 0) +
                COALESCE(one_month_sales_nykaa, 0) * COALESCE(price_nykaa, 0)
              ) / SUM(one_month_total_sales)
          END AS aov
        FROM ${tableName}
      ),
      platform_agg AS (
        SELECT
          ads_platform,
          SUM(ad_spend) AS total_ad_spend,
          SUM(clicks)   AS total_clicks
        FROM ${tableName}
        WHERE ad_spend IS NOT NULL
        GROUP BY ads_platform
      )
      SELECT
        p.ads_platform,
        p.total_ad_spend,
        p.total_clicks,
        ga.aov                               AS global_aov,
        0.02::numeric                        AS assumed_cvr,          -- 2% CVR
        (p.total_clicks * 0.02)::numeric     AS estimated_orders,
        (p.total_clicks * 0.02 * ga.aov)     AS estimated_revenue,
        CASE
          WHEN p.total_ad_spend = 0 THEN NULL
          ELSE (p.total_clicks * 0.02 * ga.aov) / p.total_ad_spend
        END AS estimated_roas_x
      FROM platform_agg p
      CROSS JOIN global_aov ga
      ORDER BY p.total_ad_spend DESC;
    `;

    const { rows } = await pool.query(query);
    res.json(
      rows.map((r) => ({
        adsPlatform: r.ads_platform,
        totalAdSpend: Number(r.total_ad_spend) || 0,
        totalClicks: Number(r.total_clicks) || 0,
        globalAov: Number(r.global_aov) || 0,
        assumedCvr: Number(r.assumed_cvr) || 0,
        estimatedOrders: Number(r.estimated_orders) || 0,
        revenue30d: Number(r.estimated_revenue) || 0,
        roasX: r.estimated_roas_x !== null ? Number(r.estimated_roas_x) : null,
      }))
    );
  } catch (error) {
    console.error("Error running channel performance query:", error.message);
    res.status(500).json({ error: "Failed to fetch channel performance data" });
  }
});

// 10) Chart – Return Rate by Category
router.get('/trends/return-rate-by-category', async (req, res) => {
  const tableName = getTableName();

  try {
    const query = `
      SELECT
        category,
        CASE
          WHEN SUM(one_month_total_sales) = 0 THEN 0
          ELSE
            ROUND(
              100.0 * SUM(total_return_units)
              / NULLIF(SUM(one_month_total_sales), 0),
              1
            )
        END AS return_rate_pct
      FROM ${tableName}
      GROUP BY category
      ORDER BY return_rate_pct DESC;
    `;

    const { rows } = await pool.query(query);
    res.json(
      rows.map((r) => ({
        category: r.category,
        returnRatePct: Number(r.return_rate_pct) || 0,
      }))
    );
  } catch (error) {
    console.error("Error running return rate by category query:", error.message);
    res.status(500).json({ error: "Failed to fetch return rate by category data" });
  }
});

export default router;


