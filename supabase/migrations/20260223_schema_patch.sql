-- Migration Patch: Ensure all outcome tracking columns exist
-- Description: Fixes the 'applied_at' missing column error

DO $$ 
BEGIN
    -- Core Timestamp for calculations
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='applied_at') THEN
        ALTER TABLE applications ADD COLUMN applied_at TIMESTAMPTZ;
    END IF;

    -- Ensure outcome_status is correct (just in case)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='outcome_status') THEN
        ALTER TABLE applications ADD COLUMN outcome_status TEXT DEFAULT 'pending' 
        CHECK (outcome_status IN ('pending', 'applied', 'responded', 'interviewing', 'offer', 'rejected', 'ghosted'));
    END IF;

    -- Ensure response_received_at exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='response_received_at') THEN
        ALTER TABLE applications ADD COLUMN response_received_at TIMESTAMPTZ;
    END IF;

    -- Ensure days_to_response exists (for caching analytic calculations)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='applications' AND column_name='days_to_response') THEN
        ALTER TABLE applications ADD COLUMN days_to_response INTEGER;
    END IF;
END $$;
