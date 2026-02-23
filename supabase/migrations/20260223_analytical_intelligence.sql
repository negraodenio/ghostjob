-- Migration: Analytical Intelligence Views
-- Description: Creates the views needed for the Transparency Leaderboard and B2B Dashboard

-- 1. View: Ghost Score Correlation (The "Proof of Value" Engine)
-- This view proves to users: "Legit jobs get X% more responses than Ghosts"
CREATE OR REPLACE VIEW view_ghost_score_correlation AS
SELECT 
  categories.score_category,
  COUNT(*) as total_tracked_apps,
  ROUND(AVG(CASE WHEN a.received_response THEN 1.0 ELSE 0.0 END) * 100, 1) as response_rate_pct,
  ROUND(AVG(CASE WHEN a.reached_interview THEN 1.0 ELSE 0.0 END) * 100, 1) as interview_rate_pct,
  ROUND(AVG(EXTRACT(DAY FROM (response_received_at - applied_at)))::NUMERIC, 1) as avg_days_to_response
FROM applications a
JOIN jobs j ON a.job_id = j.id,
LATERAL (
  SELECT CASE 
    WHEN j.ghost_score < 25 THEN 'legit'
    WHEN j.ghost_score < 50 THEN 'sus'
    WHEN j.ghost_score < 75 THEN 'ghost'
    ELSE 'certified_ghost'
  END AS score_category
) AS categories
WHERE a.outcome_status != 'pending' 
  AND a.applied_at IS NOT NULL
GROUP BY categories.score_category
ORDER BY 
  CASE 
    WHEN categories.score_category = 'legit' THEN 1
    WHEN categories.score_category = 'sus' THEN 2
    WHEN categories.score_category = 'ghost' THEN 3
    ELSE 4
  END;

-- 2. View: Company Transparency Leaderboard (The B2B Showcase)
-- Provides the data for the /rankings page with real outcome metrics
CREATE OR REPLACE VIEW view_company_leaderboard AS
SELECT 
    c.id,
    c.name,
    c.normalized_name,
    c.hiring_integrity_score,
    c.hiring_integrity_grade,
    c.overall_response_rate,
    c.avg_days_to_response,
    c.ghost_job_rate,
    c.total_jobs_posted,
    (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = c.id) as total_reports
FROM companies c
WHERE c.total_jobs_posted > 0
ORDER BY c.hiring_integrity_score DESC;

-- 3. Policy Update: Ensure Views are accessible
-- By default, views use the permissions of the owner.
GRANT SELECT ON view_ghost_score_correlation TO anon, authenticated;
GRANT SELECT ON view_company_leaderboard TO anon, authenticated;
