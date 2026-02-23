-- ============================================================
-- TRIGGER: Update Company Counters (Jobs & Applications)
-- Ensures view_company_leaderboard has accurate counts
-- ============================================================

CREATE OR REPLACE FUNCTION update_company_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE companies 
        SET total_jobs_posted = total_jobs_posted + 1
        WHERE id = NEW.company_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE companies 
        SET total_jobs_posted = GREATEST(0, total_jobs_posted - 1)
        WHERE id = OLD.company_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_company_jobs_count ON jobs;
CREATE TRIGGER trg_update_company_jobs_count
AFTER INSERT OR DELETE ON jobs
FOR EACH ROW EXECUTE FUNCTION update_company_counters();

-- ============================================================
-- TRIGGER: Update Company Application Counters
-- ============================================================

CREATE OR REPLACE FUNCTION update_company_app_counters()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
BEGIN
    SELECT company_id INTO v_company_id FROM jobs WHERE id = COALESCE(NEW.job_id, OLD.job_id);
    
    IF v_company_id IS NOT NULL THEN
        IF (TG_OP = 'INSERT') THEN
            UPDATE companies 
            SET total_applications_received = total_applications_received + 1
            WHERE id = v_company_id;
        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE companies 
            SET total_applications_received = GREATEST(0, total_applications_received - 1)
            WHERE id = v_company_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_company_apps_count ON applications;
CREATE TRIGGER trg_update_company_apps_count
AFTER INSERT OR DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION update_company_app_counters();

-- ============================================================
-- MANUALLY REFRESH COUNTERS
-- Since we already seeded data before these triggers
-- ============================================================

UPDATE companies c
SET 
    total_jobs_posted = (SELECT COUNT(*) FROM jobs WHERE company_id = c.id),
    total_applications_received = (SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = c.id);
