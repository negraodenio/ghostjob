-- Migration: Transparency Pivot & Company Normalization
-- Description: Creates the foundation for the Ghost Transparency Score™

-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    normalized_name TEXT UNIQUE NOT NULL, -- lowercase, slugified
    website_url TEXT,
    logo_url TEXT,
    
    -- Aggregated Stats (Ghost Transparency Score™ Metrics)
    total_jobs_analyzed INTEGER DEFAULT 0,
    ghost_transparency_score INTEGER DEFAULT 0, -- 0-100
    response_rate DECIMAL DEFAULT 0, -- 0-1
    avg_response_time_days DECIMAL DEFAULT 0,
    jobs_closed_count INTEGER DEFAULT 0,
    jobs_ghosted_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Company Reference and Outcome Tracking to Applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS outcome_status TEXT DEFAULT 'pending' 
    CHECK (outcome_status IN ('pending', 'applied', 'responded', 'interviewing', 'offer', 'rejected', 'ghosted'));
ALTER TABLE applications ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_report_feedback TEXT; -- Public comments for ranking

-- 3. RLS for Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read companies" 
ON companies FOR SELECT 
USING (true);

-- 4. Indexes for Ranking
CREATE INDEX IF NOT EXISTS idx_companies_transparency_score ON companies(ghost_transparency_score DESC);
CREATE INDEX IF NOT EXISTS idx_companies_normalized_name ON companies(normalized_name);
CREATE INDEX IF NOT EXISTS idx_applications_company_id ON applications(company_id);

-- 5. Trigger to update company stats (Simplified version)
-- Note: Real-time calculation can be heavy, but for MVP we update on status change.
CREATE OR REPLACE FUNCTION update_company_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.company_id IS NOT NULL) OR (TG_OP = 'UPDATE' AND NEW.company_id IS NOT NULL) THEN
        UPDATE companies
        SET 
            total_jobs_analyzed = (SELECT COUNT(*) FROM applications WHERE company_id = NEW.company_id),
            response_rate = (
                SELECT COUNT(*)::DECIMAL / NULLIF(COUNT(*), 0) 
                FROM applications 
                WHERE company_id = NEW.company_id AND outcome_status NOT IN ('pending', 'applied', 'ghosted')
            ),
            updated_at = NOW()
        WHERE id = NEW.company_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_company_metrics ON applications;
CREATE TRIGGER trg_update_company_metrics
AFTER INSERT OR UPDATE OF outcome_status ON applications
FOR EACH ROW EXECUTE FUNCTION update_company_metrics();
