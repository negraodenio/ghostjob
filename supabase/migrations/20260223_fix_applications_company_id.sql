
-- Patch: Add company_id to applications table
-- Description: Link applications directly to companies for easier aggregation in transparency reports.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='company_id') THEN
        ALTER TABLE applications ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_applications_company_id ON applications(company_id);
