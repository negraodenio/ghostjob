-- Grant permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE applications TO anon, authenticated;
GRANT ALL ON TABLE profiles TO anon, authenticated;
GRANT ALL ON TABLE interview_sessions TO anon, authenticated;

-- Ensure sequence permissions for ID generation if needed (though using UUIDs)

-- Initial Policy Cleanup
DROP POLICY IF EXISTS "Users can insert applications" ON applications;

-- Recreate Policy with Explicit Anon Support
CREATE POLICY "Enable insert for authenticated users and anon"
ON applications FOR INSERT
WITH CHECK (
  -- Authenticated users inserting their own data
  (auth.role() = 'authenticated' AND auth.uid() = user_id)
  OR
  -- Anonymous users (no user_id)
  (auth.role() = 'anon' AND user_id IS NULL)
  OR
  -- Just in case auth.role() isn't working as expected, rely on user_id
  (user_id IS NULL)
);

-- Fix Upvotes Policy too just in case
DROP POLICY IF EXISTS "Authenticated users can insert upvotes" ON upvotes;
CREATE POLICY "Authenticated users can insert upvotes"
ON upvotes FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
