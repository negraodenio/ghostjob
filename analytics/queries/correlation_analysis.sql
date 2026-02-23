-- ============================================================
-- GHOST SCORE ACCURACY: Pearson R² Calculation
-- Proves: "Does our ghost score actually predict outcomes?"
-- ============================================================

WITH scored_applications AS (
  SELECT 
    a.id,
    j.ghost_score,
    CASE 
      WHEN a.received_response THEN 1.0 
      ELSE 0.0 
    END as got_response,
    a.outcome_status
  FROM applications a
  JOIN jobs j ON a.job_id = j.id
  WHERE a.outcome_status != 'pending'
    AND a.received_response IS NOT NULL  -- Only completed outcomes
),

-- Calculate means
stats AS (
  SELECT 
    AVG(ghost_score) as mean_x,
    AVG(got_response) as mean_y,
    COUNT(*) as n
  FROM scored_applications
),

-- Calculate Pearson components
pearson_components AS (
  SELECT 
    sa.ghost_score,
    sa.got_response,
    s.mean_x,
    s.mean_y,
    (sa.ghost_score - s.mean_x) as x_diff,
    (sa.got_response - s.mean_y) as y_diff,
    POWER(sa.ghost_score - s.mean_x, 2) as x_diff_sq,
    POWER(sa.got_response - s.mean_y, 2) as y_diff_sq,
    (sa.ghost_score - s.mean_x) * (sa.got_response - s.mean_y) as xy_product
  FROM scored_applications sa
  CROSS JOIN stats s
),

-- Sum components
sums AS (
  SELECT 
    SUM(xy_product) as sum_xy,
    SUM(x_diff_sq) as sum_x_sq,
    SUM(y_diff_sq) as sum_y_sq,
    MAX(n) as n
  FROM pearson_components, stats
)

-- Final R² calculation
SELECT 
  ROUND((POWER(sum_xy, 2) / (sum_x_sq * sum_y_sq))::NUMERIC, 3) as r_squared,
  ROUND((sum_xy / SQRT(sum_x_sq * sum_y_sq))::NUMERIC, 3) as pearson_r,
  n as sample_size,
  CASE 
    WHEN (POWER(sum_xy, 2) / (sum_x_sq * sum_y_sq)) > 0.5 THEN 'STRONG CORRELATION ✅'
    WHEN (POWER(sum_xy, 2) / (sum_x_sq * sum_y_sq)) > 0.3 THEN 'MODERATE CORRELATION ⚠️'
    ELSE 'WEAK CORRELATION ❌ - ADJUST MODEL'
  END as interpretation
FROM sums;
