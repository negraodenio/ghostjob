-- NUCLEAR OPTION: Temporarily disable RLS on applications table
-- This will allow us to test if the app works without RLS

-- Disable RLS temporarily
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- Also disable on profiles just in case
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Ensure grants are in place
GRANT ALL ON TABLE applications TO authenticated, anon;
GRANT ALL ON TABLE profiles TO authenticated, anon;

-- NOTE: This is NOT secure for production!
-- We're just testing to see if RLS is the blocker
-- After this works, we'll re-enable and create proper policies
