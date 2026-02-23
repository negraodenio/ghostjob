-- ============================================================
-- MIGRATION: Outcome Tracking System - Complete Column Set
-- Phase 9: Data-First Platform
-- ============================================================
-- Description:
--   Adds all missing outcome tracking fields to applications table.
--   Adds company hiring integrity score recalculation function.
--   Safe to re-run (all ADD COLUMN use IF NOT EXISTS).
-- ============================================================

DO $$
BEGIN

    -- --------------------------------------------------------
    -- 1. CORE OUTCOME BOOLEANS
    -- --------------------------------------------------------

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='received_response') THEN
        ALTER TABLE applications ADD COLUMN received_response BOOLEAN DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='reached_interview') THEN
        ALTER TABLE applications ADD COLUMN reached_interview BOOLEAN DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='received_offer') THEN
        ALTER TABLE applications ADD COLUMN received_offer BOOLEAN DEFAULT NULL;
    END IF;

    -- --------------------------------------------------------
    -- 2. INTERVIEW DETAILS
    -- --------------------------------------------------------

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='interview_count') THEN
        ALTER TABLE applications ADD COLUMN interview_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='interview_date') THEN
        ALTER TABLE applications ADD COLUMN interview_date TIMESTAMPTZ DEFAULT NULL;
    END IF;

    -- --------------------------------------------------------
    -- 3. OFFER DETAILS
    -- --------------------------------------------------------

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='offer_date') THEN
        ALTER TABLE applications ADD COLUMN offer_date TIMESTAMPTZ DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='offer_amount') THEN
        ALTER TABLE applications ADD COLUMN offer_amount DECIMAL(12,2) DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='offer_currency') THEN
        ALTER TABLE applications ADD COLUMN offer_currency TEXT DEFAULT 'EUR';
    END IF;

    -- --------------------------------------------------------
    -- 4. FINAL OUTCOME ENUM
    --    More granular than outcome_status (which tracks the process)
    --    final_outcome is the closed-loop result
    -- --------------------------------------------------------

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='final_outcome') THEN
        ALTER TABLE applications ADD COLUMN final_outcome TEXT DEFAULT 'pending'
        CHECK (final_outcome IN (
            'pending',
            'no_response',
            'rejected_screening',
            'rejected_interview',
            'offer_declined',
            'offer_accepted',
            'withdrawn'
        ));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='outcome_updated_at') THEN
        ALTER TABLE applications ADD COLUMN outcome_updated_at TIMESTAMPTZ DEFAULT NULL;
    END IF;

    -- --------------------------------------------------------
    -- 5. QUALITATIVE USER FEEDBACK
    -- --------------------------------------------------------

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='would_recommend_applying') THEN
        ALTER TABLE applications ADD COLUMN would_recommend_applying BOOLEAN DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='user_notes') THEN
        ALTER TABLE applications ADD COLUMN user_notes TEXT DEFAULT NULL;
    END IF;

    -- --------------------------------------------------------
    -- 6. LINK APPLICATIONS ↔ JOBS (Central Intelligence)
    --    Already partially exists - ensure it's there
    -- --------------------------------------------------------

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='job_id') THEN
        ALTER TABLE applications ADD COLUMN job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;
    END IF;

END $$;

-- --------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_applications_outcome_status ON applications(outcome_status);
CREATE INDEX IF NOT EXISTS idx_applications_final_outcome ON applications(final_outcome);
CREATE INDEX IF NOT EXISTS idx_applications_received_response ON applications(received_response) WHERE received_response IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);

-- --------------------------------------------------------
-- 8. COMPANY INTEGRITY SCORE RECALCULATION FUNCTION
--    Called after every outcome update via trigger.
--    Formula (weighted composite):
--      40% response rate
--      30% interview rate
--      20% response speed (capped at 0)
--      10% inverse of ghost score
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION recalculate_company_integrity(p_company_id UUID)
RETURNS VOID AS $$
DECLARE
    v_response_rate   DECIMAL;
    v_interview_rate  DECIMAL;
    v_avg_days        DECIMAL;
    v_ghost_rate      DECIMAL;
    v_integrity_score DECIMAL;
    v_grade           TEXT;
    v_total_apps      INTEGER;
BEGIN
    -- Require minimum 5 tracked applications for meaningful score
    SELECT COUNT(*) INTO v_total_apps
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.company_id = p_company_id
      AND a.outcome_status NOT IN ('pending', 'applied');

    IF v_total_apps < 5 THEN
        -- Not enough data yet — leave existing score
        RETURN;
    END IF;

    -- Calculate raw metrics from real outcomes
    SELECT
        ROUND(AVG(CASE WHEN a.received_response THEN 1.0 ELSE 0.0 END) * 100, 2),
        ROUND(AVG(CASE WHEN a.reached_interview THEN 1.0 ELSE 0.0 END) * 100, 2),
        ROUND(AVG(
            CASE
                WHEN a.response_received_at IS NOT NULL AND a.applied_at IS NOT NULL
                THEN EXTRACT(DAY FROM (a.response_received_at - a.applied_at))
                ELSE NULL
            END
        ), 2)
    INTO v_response_rate, v_interview_rate, v_avg_days
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.company_id = p_company_id
      AND a.outcome_status NOT IN ('pending', 'applied');

    -- Ghost rate from all jobs
    SELECT ROUND(
        AVG(CASE WHEN j.ghost_score >= 61 THEN 1.0 ELSE 0.0 END) * 100, 2
    ) INTO v_ghost_rate
    FROM jobs j
    WHERE j.company_id = p_company_id;

    -- Compute composite integrity score
    v_integrity_score := ROUND(
        COALESCE(v_response_rate, 0) * 0.40 +
        COALESCE(v_interview_rate, 0) * 0.30 +
        GREATEST(0, 100 - COALESCE(v_avg_days, 30) * 3) * 0.20 +
        (100 - COALESCE(v_ghost_rate, 50)) * 0.10,
    1);

    v_integrity_score := LEAST(100, GREATEST(0, v_integrity_score));

    -- Assign grade
    v_grade := CASE
        WHEN v_integrity_score >= 85 THEN 'A'
        WHEN v_integrity_score >= 70 THEN 'B'
        WHEN v_integrity_score >= 55 THEN 'C'
        WHEN v_integrity_score >= 40 THEN 'D'
        ELSE 'F'
    END;

    -- Persist
    UPDATE companies SET
        overall_response_rate   = v_response_rate,
        overall_interview_rate  = v_interview_rate,
        avg_days_to_response    = v_avg_days,
        ghost_job_rate          = v_ghost_rate,
        hiring_integrity_score  = v_integrity_score,
        hiring_integrity_grade  = v_grade,
        last_metrics_update     = NOW()
    WHERE id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------
-- 9. TRIGGER: Auto-recalculate company score on outcome update
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION trg_on_outcome_updated()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
BEGIN
    -- Get the company from the linked job
    IF NEW.job_id IS NOT NULL THEN
        SELECT j.company_id INTO v_company_id
        FROM jobs j WHERE j.id = NEW.job_id;
    END IF;

    -- Also update days_to_response cache
    IF NEW.received_response = TRUE AND NEW.response_received_at IS NOT NULL AND NEW.applied_at IS NOT NULL THEN
        NEW.days_to_response := EXTRACT(DAY FROM (NEW.response_received_at - NEW.applied_at))::INTEGER;
    END IF;

    NEW.outcome_updated_at := NOW();

    -- Async-style: recalculate company after row is updated
    IF v_company_id IS NOT NULL THEN
        PERFORM recalculate_company_integrity(v_company_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_outcome_updated ON applications;
CREATE TRIGGER trg_outcome_updated
BEFORE UPDATE OF outcome_status, received_response, reached_interview, received_offer, final_outcome
ON applications
FOR EACH ROW
EXECUTE FUNCTION trg_on_outcome_updated();

-- --------------------------------------------------------
-- 10. RLS POLICY: Users can only update their own outcome
-- --------------------------------------------------------

DROP POLICY IF EXISTS "Users can update own application outcome" ON applications;
CREATE POLICY "Users can update own application outcome" ON applications
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant anon read for public ghost-wall entries
DROP POLICY IF EXISTS "Public can read public applications" ON applications;
CREATE POLICY "Public can read public applications" ON applications
FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
