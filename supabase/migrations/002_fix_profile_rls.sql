-- Fix RLS policy for profile creation during signup
-- The issue is that during signup, the user might not be fully authenticated yet

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows users to insert their own profile
-- This works during signup because auth.uid() returns the user's ID even during signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Alternative: If the above still doesn't work, you can use this more permissive policy
-- (Only use if the above doesn't work - it's less secure)
-- CREATE POLICY "Users can insert own profile" ON profiles
--   FOR INSERT 
--   TO authenticated
--   WITH CHECK (true);

-- Also ensure the user can insert during the signup process
-- This policy allows insertion if the id matches the authenticated user
CREATE POLICY "Allow profile creation on signup" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = id
  );

