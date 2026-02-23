-- Migration: Movement Foundation
-- Description: Adds Notification system and B2B Company Verification fields

-- 1. Notifications Table (The bridge for the Autopilot Prompts)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('outcome_check', 'market_alert', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT, -- Link to the outcome tracker
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. B2B: Company Verification Logic
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_bio TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hiring_policy_url TEXT;

-- 3. RLS for Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own notifications" ON notifications;
CREATE POLICY "Users can manage their own notifications" ON notifications
FOR ALL USING (auth.uid() = user_id);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
