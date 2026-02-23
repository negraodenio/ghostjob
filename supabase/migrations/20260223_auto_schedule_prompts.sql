-- Migration: Auto-schedule Outcome Prompts Trigger
-- Description: Automatically populates the tracking queue when an application is marked as 'applied'

CREATE OR REPLACE FUNCTION schedule_outcome_prompts()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when status moves to 'applied' or 'interviewing' for the first time
    IF (NEW.outcome_status IN ('applied', 'interviewing') AND (OLD.outcome_status IS NULL OR OLD.outcome_status = 'pending')) THEN
        
        -- 1. Initial 7-day Check-in
        INSERT INTO outcome_tracking_prompts (application_id, prompt_type, scheduled_for, method)
        VALUES (NEW.id, 'initial_7d', NOW() + INTERVAL '7 days', 'email')
        ON CONFLICT DO NOTHING;

        -- 2. Follow-up 14-day Persistence
        INSERT INTO outcome_tracking_prompts (application_id, prompt_type, scheduled_for, method)
        VALUES (NEW.id, 'followup_14d', NOW() + INTERVAL '14 days', 'in_app')
        ON CONFLICT DO NOTHING;

        -- 3. Final 30-day Outcome Grab
        INSERT INTO outcome_tracking_prompts (application_id, prompt_type, scheduled_for, method)
        VALUES (NEW.id, 'final_30d', NOW() + INTERVAL '30 days', 'email')
        ON CONFLICT DO NOTHING;

    END IF;

    -- If the user already reached a final outcome, skip/expire future prompts for this application
    IF (NEW.outcome_status IN ('offer', 'rejected', 'ghosted')) THEN
        UPDATE outcome_tracking_prompts
        SET status = 'skipped'
        WHERE application_id = NEW.id AND status = 'pending';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Trigger
DROP TRIGGER IF EXISTS trg_schedule_outcome_prompts ON applications;
CREATE TRIGGER trg_schedule_outcome_prompts
AFTER UPDATE OF outcome_status ON applications
FOR EACH ROW EXECUTE FUNCTION schedule_outcome_prompts();
