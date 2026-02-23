-- Migration: Ultimate Outcome Tracking Infrastructure
-- Description: Implements the Phase 1 "Brutal Data" model for Ghost Transparency Score™

-- 🚨 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 🏢 1. Companies Table (Enhanced)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    normalized_name TEXT UNIQUE NOT NULL, -- lowercase-slugified
    domain TEXT UNIQUE, -- e.g. 'google.com'
    website_url TEXT,
    linkedin_url TEXT,
    logo_url TEXT,
    
    -- Metadata
    industry TEXT,
    size_category TEXT, -- 'startup', 'mid', 'enterprise'
    founded_year INTEGER,
    funding_stage TEXT, 
    
    -- Hiring Integrity Score™ (CORE VALUE)
    hiring_integrity_score DECIMAL(5,2) DEFAULT 0,
    hiring_integrity_grade TEXT CHECK (hiring_integrity_grade IN ('A', 'B', 'C', 'D', 'F')) DEFAULT 'C',
    
    -- Aggregated Stats
    total_jobs_posted INTEGER DEFAULT 0,
    total_applications_received INTEGER DEFAULT 0,
    overall_response_rate DECIMAL(5,2) DEFAULT 0,
    avg_days_to_response DECIMAL(6,2) DEFAULT 0,
    ghost_job_rate DECIMAL(5,2) DEFAULT 0,
    
    verified_company BOOLEAN DEFAULT FALSE,
    is_staffing_agency BOOLEAN DEFAULT FALSE,
    suspicious_activity BOOLEAN DEFAULT FALSE,
    
    last_metrics_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📄 2. Jobs Table (Postings & Analysis Storage)
-- This deduplicates analyses of the same job description across different users.
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    job_title TEXT NOT NULL,
    job_description TEXT NOT NULL,
    job_description_hash TEXT UNIQUE, -- For fuzzy matching/repost detection
    
    source_url TEXT,
    source_platform TEXT, -- 'linkedin', 'glassdoor', etc.
    
    -- Ghost Score & Analysis (Cached)
    ghost_score DECIMAL(5,2),
    ghost_verdict TEXT CHECK (ghost_verdict IN ('legit', 'sus', 'ghost', 'certified_ghost')),
    confidence_score DECIMAL(5,2),
    
    -- Quality Breakdown
    clarity_score INTEGER,
    realism_score INTEGER,
    transparency_score INTEGER,
    
    -- Feature Flags
    has_salary BOOLEAN,
    has_named_contact BOOLEAN,
    has_specific_tech_stack BOOLEAN,
    is_remote BOOLEAN,
    
    -- Red/Green Flags (Rich JSONB)
    red_flags JSONB DEFAULT '[]',
    green_flags JSONB DEFAULT '[]',
    
    -- Temporal Data
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    repost_count INTEGER DEFAULT 0,
    
    -- Aggregated Outcomes (From Applications)
    total_applications INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0,
    avg_days_to_response DECIMAL(6,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🚀 3. Applications Table (Outcome Tracking Enhancement)
-- We check if columns exist before adding them for idempotency
DO $$ 
BEGIN
    -- Linking to Jobs
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='job_id') THEN
        ALTER TABLE applications ADD COLUMN job_id UUID REFERENCES jobs(id);
    END IF;

    -- Tracking Fields
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='applied_at') THEN
        ALTER TABLE applications ADD COLUMN applied_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='application_method') THEN
        ALTER TABLE applications ADD COLUMN application_method TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='outcome_status') THEN
        ALTER TABLE applications ADD COLUMN outcome_status TEXT DEFAULT 'pending' 
        CHECK (outcome_status IN ('pending', 'applied', 'responded', 'interviewing', 'offer', 'rejected', 'ghosted'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='received_response') THEN
        ALTER TABLE applications ADD COLUMN received_response BOOLEAN DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='response_received_at') THEN
        ALTER TABLE applications ADD COLUMN response_received_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='reached_interview') THEN
        ALTER TABLE applications ADD COLUMN reached_interview BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='received_offer') THEN
        ALTER TABLE applications ADD COLUMN received_offer BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='offer_amount') THEN
        ALTER TABLE applications ADD COLUMN offer_amount NUMERIC(12,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='would_recommend_applying') THEN
        ALTER TABLE applications ADD COLUMN would_recommend_applying BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='outcome_updated_at') THEN
        ALTER TABLE applications ADD COLUMN outcome_updated_at TIMESTAMPTZ;
    END IF;
END $$;

-- 🔔 4. Outcome Tracking Prompts (Scheduling Logic)
CREATE TABLE IF NOT EXISTS outcome_tracking_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) NOT NULL,
    prompt_type TEXT CHECK (prompt_type IN ('initial_7d', 'followup_14d', 'final_30d')) NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    method TEXT DEFAULT 'email', -- 'email', 'in_app'
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'skipped', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔒 5. RLS & Permissions
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_tracking_prompts ENABLE ROW LEVEL SECURITY;

-- Companies: Public Read
DROP POLICY IF EXISTS "Public Read Companies" ON companies;
CREATE POLICY "Public Read Companies" ON companies FOR SELECT USING (true);

-- Jobs: Public Read
DROP POLICY IF EXISTS "Public Read Jobs" ON jobs;
CREATE POLICY "Public Read Jobs" ON jobs FOR SELECT USING (true);

-- Applications: User Specific
DROP POLICY IF EXISTS "Users can only see their own applications" ON applications;
CREATE POLICY "Users can only see their own applications" ON applications 
FOR ALL USING (auth.uid() = user_id);

-- Prompts: System/Service Role primarily (or user read-only)
ALTER TABLE outcome_tracking_prompts FORCE ROW LEVEL SECURITY;

-- 📊 6. Indexes for Intelligence
CREATE INDEX IF NOT EXISTS idx_jobs_hash ON jobs(job_description_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_ghost_score ON jobs(ghost_score);
CREATE INDEX IF NOT EXISTS idx_apps_outcome ON applications(outcome_status);
CREATE INDEX IF NOT EXISTS idx_prompts_scheduled ON outcome_tracking_prompts(scheduled_for) WHERE status = 'pending';

-- ⚡ 7. Intelligence Trigger: Update Integrity Score
CREATE OR REPLACE FUNCTION calculate_hiring_integrity()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_resp_rate DECIMAL;
    v_avg_days DECIMAL;
    v_ghost_job_rate DECIMAL;
BEGIN
    -- Get Company ID via Job relation
    SELECT company_id INTO v_company_id 
    FROM jobs 
    WHERE id = COALESCE(NEW.job_id, OLD.job_id);
    
    IF v_company_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Calculate Metrics (joining with jobs to filter by company)
    SELECT 
        AVG(CASE WHEN a.received_response THEN 1.0 ELSE 0.0 END) * 100,
        AVG(EXTRACT(DAY FROM (a.response_received_at - a.applied_at)))
    INTO v_resp_rate, v_avg_days
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.company_id = v_company_id AND a.applied_at IS NOT NULL;
    
    -- Calculate Ghost Job Rate from analysis data
    SELECT 
        AVG(CASE WHEN ghost_verdict IN ('ghost', 'certified_ghost') THEN 1.0 ELSE 0.0 END) * 100
    INTO v_ghost_job_rate
    FROM jobs 
    WHERE company_id = v_company_id;

    -- Update Company
    UPDATE companies
    SET 
        overall_response_rate = COALESCE(v_resp_rate, 0),
        avg_days_to_response = COALESCE(v_avg_days, 0),
        ghost_job_rate = COALESCE(v_ghost_job_rate, 0),
        -- Formula: 40% Response Rate + 40% (100-Ghost Rate) + 20% Speed
        hiring_integrity_score = (
            (COALESCE(v_resp_rate, 0) * 0.4) + 
            ((100 - COALESCE(v_ghost_job_rate, 0)) * 0.4) + 
            (GREATEST(0, (100 - COALESCE(v_avg_days, 0) * 7.14)) * 0.2)
        ),
        updated_at = NOW()
    WHERE id = v_company_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_integrity ON applications;
CREATE TRIGGER trg_calculate_integrity
AFTER INSERT OR UPDATE OF outcome_status, received_response, response_received_at ON applications
FOR EACH ROW EXECUTE FUNCTION calculate_hiring_integrity();
