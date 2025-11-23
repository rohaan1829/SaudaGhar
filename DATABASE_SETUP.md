# Database Setup Guide

## Error: "Could not find the table 'public.profiles'"

This error means the database tables haven't been created yet. Follow these steps to set up your database.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the Migration

1. Open the file `supabase/migrations/001_initial_schema.sql` in this project
2. Copy **ALL** the SQL code from that file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

## Step 3: Verify Tables Were Created

After running the migration, verify the tables exist:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `listings`
   - ✅ `messages`
   - ✅ `notifications`
   - ✅ `ratings`
   - ✅ `transactions`

## Step 4: Set Up Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**

### Create `documents` bucket:
   - Name: `documents`
   - Public: **No** (unchecked - private)
   - Click **Create bucket**

### Create `listing-images` bucket:
   - Name: `listing-images`
   - Public: **Yes** (checked - public)
   - Click **Create bucket**

## Step 5: Set Up Storage Policies

After creating buckets, you need to set up policies. Go to **Storage** > **Policies** for each bucket:

### For `documents` bucket:

Click on `documents` bucket > **Policies** > **New Policy**

**Policy 1: Users can upload their own documents**
- Policy name: `Users can upload own documents`
- Allowed operation: `INSERT`
- Policy definition:
```sql
(bucket_id = 'documents'::text) AND ((auth.uid())::text = split_part(name, '/', 1))
```

**Policy 2: Users can view their own documents**
- Policy name: `Users can view own documents`
- Allowed operation: `SELECT`
- Policy definition:
```sql
(bucket_id = 'documents'::text) AND ((auth.uid())::text = split_part(name, '/', 1))
```

### For `listing-images` bucket:

Click on `listing-images` bucket > **Policies** > **New Policy**

**Policy 1: Users can upload listing images**
- Policy name: `Users can upload listing images`
- Allowed operation: `INSERT`
- Policy definition:
```sql
bucket_id = 'listing-images'::text
```

**Policy 2: Anyone can view listing images**
- Policy name: `Anyone can view listing images`
- Allowed operation: `SELECT`
- Policy definition:
```sql
bucket_id = 'listing-images'::text
```

## Quick SQL Script for Storage Policies

If you prefer, you can run this SQL in the SQL Editor:

```sql
-- Storage policies for documents bucket
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = split_part(name, '/', 1));

-- Storage policies for listing-images bucket
CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-images');
```

## Troubleshooting

### If you get "relation already exists" errors:
- Some tables might already exist. You can either:
  1. Drop existing tables and re-run the migration, OR
  2. Comment out the CREATE TABLE statements for existing tables

### If RLS policies fail:
- Make sure you've run the entire migration file
- Check that the `auth.users` table exists (it's created automatically by Supabase)

### If storage uploads fail:
- Verify buckets are created
- Check storage policies are set up correctly
- Ensure bucket names match exactly: `documents` and `listing-images`

## Verify Everything Works

After setup, test by:

1. **Creating a user account** - Registration should work
2. **Creating a listing** - Should be able to upload images
3. **Viewing listings** - Should see data in the listings table

If you still get errors, check:
- Environment variables are set correctly in `.env.local`
- Supabase project is active
- You're using the correct project URL and keys

