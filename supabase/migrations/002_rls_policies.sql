-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- APPLICATIONS POLICIES
-- ============================================

-- Users can read their own applications
CREATE POLICY "Users can read own applications"
ON applications FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can read public applications (for Ghost Wall)
CREATE POLICY "Anyone can read public applications"
ON applications FOR SELECT
USING (is_public = TRUE);

-- Users can insert applications
CREATE POLICY "Users can insert applications"
ON applications FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own applications
CREATE POLICY "Users can update own applications"
ON applications FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- INTERVIEW SESSIONS POLICIES
-- ============================================

-- Users can read their own interview sessions
CREATE POLICY "Users can read own interview sessions"
ON interview_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own interview sessions
CREATE POLICY "Users insert own interview sessions"
ON interview_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own interview sessions
CREATE POLICY "Users can update own interview sessions"
ON interview_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhook handling)
-- No user-facing INSERT/UPDATE policies needed (handled by webhooks)

-- ============================================
-- UPVOTES POLICIES
-- ============================================

-- Anyone can read upvotes
CREATE POLICY "Anyone can read upvotes"
ON upvotes FOR SELECT
TO authenticated
USING (TRUE);

-- Authenticated users can insert upvotes
CREATE POLICY "Authenticated users can insert upvotes"
ON upvotes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own upvotes
CREATE POLICY "Users can delete own upvotes"
ON upvotes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
