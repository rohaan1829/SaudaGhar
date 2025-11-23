# Deployment Guide for SaudaGhar

## Prerequisites

1. Supabase account and project
2. Vercel account
3. GitHub repository (optional, but recommended)

## Step 1: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration file:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in Supabase SQL Editor

3. Set up Storage buckets:
   - Go to Storage in Supabase dashboard
   - Create bucket named `documents` (private)
   - Create bucket named `listing-images` (public)
   - Set up storage policies as described in `supabase/README.md`

4. Get your Supabase credentials:
   - Go to Settings > API
   - Copy `Project URL` and `anon public` key
   - Copy `service_role` key (keep this secret!)

## Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 to test the application.

## Step 5: Deploy to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from `.env.local`

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository (or deploy from local)
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click "Deploy"

## Step 6: Post-Deployment

1. Update Supabase Auth settings:
   - Go to Authentication > URL Configuration
   - Add your Vercel domain to "Site URL" and "Redirect URLs"

2. Test the deployed application:
   - Register a new user
   - Create a listing
   - Test search functionality

## Troubleshooting

### Images not loading
- Check Supabase Storage bucket policies
- Verify bucket is set to public (for listing-images)
- Check image URLs in database

### Authentication not working
- Verify Supabase Auth redirect URLs include your Vercel domain
- Check environment variables are set correctly

### Database errors
- Verify RLS policies are set up correctly
- Check user permissions in Supabase

## Notes

- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side
- Never commit `.env.local` to version control
- Keep your service role key secure

