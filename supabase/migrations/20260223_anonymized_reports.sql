-- ============================================================
-- VIEW: Industry-Level Transparency Analytics (Anonymized)
-- Focuses on Sectors rather than individual companies
-- ============================================================

CREATE OR REPLACE VIEW view_industry_transparency_reports AS
WITH industry_metrics AS (
    SELECT 
        COALESCE(c.industry, 'General Tech') as industry,
        COUNT(DISTINCT c.id) as company_count,
        SUM(c.total_applications_received) as total_apps,
        AVG(c.hiring_integrity_score) as avg_integrity_score,
        AVG(c.overall_response_rate) as avg_response_rate,
        AVG(c.ghost_job_rate) as avg_ghost_rate,
        AVG(c.avg_days_to_response) as avg_velocity
    FROM companies c
    WHERE c.total_applications_received >= 0
    GROUP BY COALESCE(c.industry, 'General Tech')
)
SELECT 
    COALESCE(industry, 'General Tech') as sector_name,
    company_count,
    total_apps as dataset_size,
    ROUND(avg_integrity_score, 1) as sector_integrity_index,
    ROUND(avg_response_rate, 1) as sector_response_rate,
    ROUND(avg_ghost_rate, 1) as sector_ghost_ratio,
    ROUND(avg_velocity, 1) as market_velocity_days,
    CASE 
        WHEN avg_integrity_score > 80 THEN 'High Transparency'
        WHEN avg_integrity_score > 50 THEN 'Mixed Integrity'
        ELSE 'Transparency Gap'
    END as sector_status
FROM industry_metrics
ORDER BY avg_integrity_score DESC;

-- ============================================================
-- VIEW: Anonymized Company Rankings
-- Shows leaders without names to prevent legal friction
-- ============================================================

CREATE OR REPLACE VIEW view_anonymized_rankings AS
SELECT 
    'Company #' || (ROW_NUMBER() OVER (ORDER BY hiring_integrity_score DESC)) as anonymized_name,
    COALESCE(industry, 'General Tech') as sector,
    hiring_integrity_score as score,
    hiring_integrity_grade as grade,
    total_applications_received as data_points,
    verified_company
FROM companies
WHERE total_applications_received >= 0
ORDER BY hiring_integrity_score DESC;

-- Grant permissions for public access
GRANT SELECT ON view_industry_transparency_reports TO anon, authenticated;
GRANT SELECT ON view_anonymized_rankings TO anon, authenticated;
