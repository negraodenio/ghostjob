-- First, let's see what policies exist
-- Run this query first to check:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'applications';

-- Drop ALL existing INSERT policies on applications
DROP POLICY IF EXISTS "Users can insert applications" ON applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users and anon" ON applications;
DROP POLICY IF EXISTS "Authenticated users can insert applications" ON applications;

-- Create a SUPER permissive policy for testing
-- This allows ANYONE (authenticated or not) to insert ANY row
CREATE POLICY "Allow all inserts temporarily"
ON applications FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Also ensure the table grants are correct
GRANT ALL ON TABLE applications TO authenticated, anon;
