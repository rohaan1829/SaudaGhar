# Environment Variables Setup

## Quick Start

1. **Copy the example file:**
   ```bash
   cp env.example.txt .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to **Settings** > **API**
   - Copy the following values:

3. **Fill in `.env.local` with your actual values:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

## Where to Find These Values

### Supabase Project URL
- Location: Supabase Dashboard > Settings > API
- Look for: **Project URL**
- Format: `https://xxxxxxxxxxxxx.supabase.co`

### Supabase Anon Key
- Location: Supabase Dashboard > Settings > API
- Look for: **anon public** key
- This is safe to expose in client-side code
- Format: Long JWT token starting with `eyJ...`

### Supabase Service Role Key
- Location: Supabase Dashboard > Settings > API
- Look for: **service_role** key
- ⚠️ **KEEP THIS SECRET!** Never expose in client-side code
- Format: Long JWT token starting with `eyJ...`

## For Vercel Deployment

When deploying to Vercel, add these same environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- ✅ `.env.local` is already in `.gitignore` - it won't be committed
- ✅ `NEXT_PUBLIC_*` variables are safe to expose (they're public)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is secret - only use server-side
- ⚠️ Never commit `.env.local` to version control

## Testing

After setting up your `.env.local` file:

```bash
npm run dev
```

The app should connect to your Supabase project. If you see connection errors, double-check your credentials.

