# Mock Data Seeding Scripts

This directory contains scripts to populate the database with mock data for development and testing.

## Prerequisites

1. Make sure you have Node.js installed
2. Install dependencies: `npm install`
3. Set up your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Running the Seed Script

To populate listings with mock data:

```bash
npm run seed
```

Or directly with tsx:

```bash
npx tsx scripts/seed-listings.ts
```

## What the Script Does

1. **Generates 50 realistic listings** with:
   - Random materials from different categories
   - Various conditions (New, Used, Leftover, Waste, Recyclable)
   - Different listing types (Buy, Sell, Exchange)
   - Random quantities and prices
   - Different cities across Pakistan
   - Random creation dates (within last 30 days)

2. **Creates test users** if needed:
   - Automatically creates test user accounts if there aren't enough existing users
   - Associates listings with random users

3. **Inserts data in batches**:
   - Processes listings in batches of 10 for better performance

## Notes

- The script uses the **service role key** to bypass Row Level Security (RLS) policies
- Images are left empty (`[]`) so you can add them manually through the dashboard
- All listings are set to `active` status
- The script will create test users if needed, but it's better to have real users registered first

## Customization

You can modify the script to:
- Change the number of listings: Edit the `listingCount` variable
- Adjust the date range: Modify the `daysAgo` calculation
- Add more material names: Expand the `MATERIAL_NAMES` object
- Change price ranges: Modify the `prices` array

## Troubleshooting

**Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set**
- Make sure your `.env.local` file exists and contains the required variables
- The service role key can be found in your Supabase project settings under API

**Error: No users available**
- Create at least one user account through the registration form first
- Or let the script create test users automatically

**Error: Permission denied**
- Make sure you're using the service role key, not the anon key
- Check that your Supabase project has the correct RLS policies set up

