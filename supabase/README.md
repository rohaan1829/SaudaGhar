# Supabase Setup Instructions

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `migrations/001_initial_schema.sql` to create all tables and policies

## Storage Buckets Setup

1. Go to Storage in your Supabase dashboard
2. Create the following buckets:

### 1. `documents` bucket
- **Public**: No (private)
- **Allowed MIME types**: image/jpeg, image/png, application/pdf
- **File size limit**: 5MB
- **Purpose**: Store CNIC photos and business licenses

### 2. `listing-images` bucket
- **Public**: Yes (public)
- **Allowed MIME types**: image/jpeg, image/png, image/webp
- **File size limit**: 10MB
- **Purpose**: Store listing images

## Storage Policies

After creating buckets, set up these policies. You can do this in two ways:

### Method 1: Using Supabase Storage UI (Recommended)

1. Go to **Storage** > Click on the bucket name > **Policies** tab
2. Click **New Policy** or **Add Policy**
3. For each policy, fill in:
   - **Policy name**: (see below)
   - **Allowed operation**: (see below)
   - **Policy definition**: (ONLY the condition, NOT the full CREATE POLICY statement)

#### For `documents` bucket:

**Policy 1: Users can upload their own documents**
- Policy name: `Users can upload own documents`
- Allowed operation: `INSERT`
- Policy definition (condition only):
```sql
bucket_id = 'documents' AND auth.uid()::text = split_part(name, '/', 1)
```

**Policy 2: Users can view their own documents**
- Policy name: `Users can view own documents`
- Allowed operation: `SELECT`
- Policy definition (condition only):
```sql
bucket_id = 'documents' AND auth.uid()::text = split_part(name, '/', 1)
```

#### For `listing-images` bucket:

**Policy 1: Users can upload listing images**
- Policy name: `Users can upload listing images`
- Allowed operation: `INSERT`
- Policy definition (condition only):
```sql
bucket_id = 'listing-images'
```

**Policy 2: Anyone can view listing images**
- Policy name: `Anyone can view listing images`
- Allowed operation: `SELECT`
- Policy definition (condition only):
```sql
bucket_id = 'listing-images'
```

### Method 2: Using SQL Editor

If you prefer to use the SQL Editor, run these full statements:

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

## Environment Variables

Make sure to set these in your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

