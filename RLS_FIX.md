# Fix: "new row violates row-level security policy for table 'profiles'"

This error occurs when trying to create a profile during user registration. The RLS policy is blocking the insert.

## Quick Fix: Run Additional SQL Migration

1. Go to Supabase SQL Editor
2. Run the SQL from `supabase/migrations/002_fix_profile_rls.sql`

This will:
- Update the RLS policy to properly allow profile creation during signup
- Ensure authenticated users can create their own profile

## Alternative Solution: Use Database Trigger (Recommended)

If the RLS fix doesn't work, you can create a database trigger that automatically creates a profile when a user signs up. This bypasses RLS issues.

### Step 1: Create the Trigger Function

Run this SQL in Supabase SQL Editor:

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 2: Update Registration Form

If using the trigger approach, modify the registration form to:
1. Create the auth user
2. Upload files
3. Update the profile (instead of inserting)

The trigger will create the initial profile, then you update it with the full details.

## Solution 3: Update RLS Policy (Simplest)

Run this SQL to make the profile insert policy more permissive:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policy that works during signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also add a policy that allows profile creation during signup
CREATE POLICY "Allow profile creation on signup" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = id
  );
```

## Why This Happens

During user signup:
1. The auth user is created in `auth.users`
2. The app tries to create a profile in `public.profiles`
3. RLS checks if the user is authenticated and if `auth.uid() = id`
4. Sometimes there's a timing issue where the auth context isn't fully set

## Recommended Approach

**Use Solution 3** (Update RLS Policy) - it's the simplest and most secure. The migration file `002_fix_profile_rls.sql` contains the fix.

After running the migration:
1. Restart your Next.js dev server
2. Try registering a new user
3. The profile should be created successfully

## Verify the Fix

After applying the fix:
1. Try registering a new user
2. Check the `profiles` table in Supabase - you should see the new profile
3. The user should be able to log in and access the dashboard

If you still get errors, check:
- The RLS policies are correctly applied (go to Table Editor > profiles > Policies)
- The user is properly authenticated after signup
- The profile insert is using the correct user ID

