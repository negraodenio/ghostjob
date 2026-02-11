-- DIAGNOSTIC QUERY - Run this FIRST to see what's going on
-- Copy the output and send it to me

SELECT 'RLS Status' as info, tablename, rowsecurity::text as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('applications', 'profiles')

UNION ALL

SELECT 'Policies' as info, tablename, 
       policyname || ' | cmd: ' || cmd || ' | roles: ' || array_to_string(roles, ',') as rls_enabled
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('applications', 'profiles')

UNION ALL

SELECT 'Grants' as info, table_name,
       'privilege: ' || privilege_type || ' | grantee: ' || grantee as rls_enabled
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('applications', 'profiles')
AND grantee IN ('anon', 'authenticated');
