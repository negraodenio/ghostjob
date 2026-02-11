-- Migration 009: Database Integrity Fixes
-- 1. Fix Applications Foreign Key (Cascade Delete)
-- This ensures that deleting a user profile will also remove their associated applications.

DO $$ 
BEGIN
    -- Only attempt to drop if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'applications_user_id_fkey') THEN
        ALTER TABLE applications DROP CONSTRAINT applications_user_id_fkey;
    END IF;
END $$;

ALTER TABLE applications
ADD CONSTRAINT applications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- 2. Consistency Trigger for Interview Sessions
-- This ensures that an interview session's user_id always matches its parent application's user_id.

CREATE OR REPLACE FUNCTION check_interview_ownership()
RETURNS TRIGGER AS $$
DECLARE
    app_owner_id UUID;
BEGIN
    -- Get the owner of the application
    SELECT user_id INTO app_owner_id
    FROM applications
    WHERE id = NEW.application_id;

    -- If the application has an owner, ensure the session belongs to the same user
    -- We allow app_owner_id to be NULL (for orphaned records if we hadn't used CASCADE)
    -- but since we now use CASCADE, it should usually exist for the duration of the check.
    IF app_owner_id IS NOT NULL AND NEW.user_id != app_owner_id THEN
        RAISE EXCEPTION 'Ownership mismatch: Interview session user_id (%) does not match application owner_id (%)', NEW.user_id, app_owner_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trg_check_interview_ownership ON interview_sessions;

CREATE TRIGGER trg_check_interview_ownership
BEFORE INSERT OR UPDATE ON interview_sessions
FOR EACH ROW
EXECUTE FUNCTION check_interview_ownership();
