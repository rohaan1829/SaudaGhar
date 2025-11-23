/**
 * Mock Data Seeding Script for Listings
 * 
 * This script populates the database with realistic listing data.
 * 
 * Usage:
 *   npx tsx scripts/seed-listings.ts
 * 
 * Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Import categories and locations directly (since we can't use app imports in scripts)
const MATERIAL_CATEGORIES = [
  'Agricultural Waste',
  'Textile Waste',
  'Plastic Waste',
  'Metal Scrap',
  'Paper Waste',
  'Food Waste',
  'Construction Materials',
  'Electronic Waste',
  'Leather Waste',
  'Chemical Waste',
  'Organic Compost',
  'Other',
] as const

const MATERIAL_CONDITIONS = [
  'New',
  'Used',
  'Leftover',
  'Waste',
  'Recyclable',
] as const

const LISTING_TYPES = ['Buy', 'Sell', 'Exchange'] as const

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Hyderabad',
  'Gujranwala',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Rahim Yar Khan',
  'Jhang',
  'Dera Ghazi Khan',
  'Gujrat',
  'Kasur',
  'Mardan',
  'Mingora',
  'Nawabshah',
  'Chiniot',
  'Kotri',
  'Khanpur',
  'Hafizabad',
  'Kohat',
  'Jacobabad',
  'Shikarpur',
  'Muzaffargarh',
  'Khanewal',
  'Gojra',
  'Bahawalnagar',
  'Abbottabad',
  'Muridke',
  'Pakpattan',
  'Chakwal',
  'Other',
] as const

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  console.error('')
  console.error('Please create a .env.local file in the project root with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.error('')
  console.error('You can find these values in your Supabase project dashboard:')
  console.error('  Settings > API')
  console.error('')
  process.exit(1)
}

// Trim whitespace from keys (common issue)
const cleanedUrl = SUPABASE_URL.trim()
const cleanedKey = SUPABASE_SERVICE_ROLE_KEY.trim()

// Validate the service role key format (should start with eyJ and be a JWT)
if (!cleanedKey.startsWith('eyJ')) {
  console.error('❌ Error: Invalid SUPABASE_SERVICE_ROLE_KEY format')
  console.error('')
  console.error('The service role key should be a JWT token starting with "eyJ"')
  console.error('Make sure you copied the "service_role" key, not the "anon" key')
  console.error('')
  console.error('Check your Supabase dashboard: Settings > API > service_role key')
  process.exit(1)
}

const supabase = createClient(cleanedUrl, cleanedKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Mock material names by category
const MATERIAL_NAMES: Record<string, string[]> = {
  'Agricultural Waste': [
    'Rice Husk',
    'Wheat Straw',
    'Sugarcane Bagasse',
    'Cotton Stalks',
    'Corn Cobs',
    'Sunflower Husk',
    'Mustard Stalks',
    'Potato Peels',
    'Vegetable Waste',
    'Fruit Peels',
    'Animal Manure',
    'Compost Material',
  ],
  'Textile Waste': [
    'Cotton Fabric Scraps',
    'Denim Waste',
    'Yarn Waste',
    'Thread Remnants',
    'Fabric Cuttings',
    'Old Garments',
    'Textile Dust',
    'Fiber Waste',
  ],
  'Plastic Waste': [
    'PET Bottles',
    'HDPE Containers',
    'Plastic Bags',
    'Plastic Film',
    'PP Wrapping',
    'PVC Pipes Scraps',
    'Plastic Granules',
  ],
  'Metal Scrap': [
    'Steel Scraps',
    'Aluminum Cans',
    'Copper Wire',
    'Brass Scraps',
    'Iron Pieces',
    'Stainless Steel',
    'Metal Shavings',
  ],
  'Paper Waste': [
    'Cardboard Boxes',
    'Newspaper',
    'Office Paper',
    'Magazines',
    'Paper Bags',
    'Packaging Paper',
  ],
  'Food Waste': [
    'Expired Food Products',
    'Food Processing Waste',
    'Grain Spoilage',
    'Bakery Waste',
    'Restaurant Waste',
  ],
  'Construction Materials': [
    'Cement Bags (Partial)',
    'Sand Remnants',
    'Gravel Leftover',
    'Bricks (Broken)',
    'Steel Rods (Cut)',
    'Tiles (Remnant)',
  ],
  'Electronic Waste': [
    'Old Circuit Boards',
    'Electronic Components',
    'Battery Cells',
    'Cable Waste',
    'Electronic Scraps',
  ],
  'Leather Waste': [
    'Leather Scraps',
    'Leather Cuttings',
    'Leather Dust',
  ],
  'Chemical Waste': [
    'Industrial Chemicals',
    'Solvent Remnants',
    'Chemical Containers',
  ],
  'Organic Compost': [
    'Mature Compost',
    'Vermicompost',
    'Organic Fertilizer',
  ],
  'Other': [
    'Mixed Waste',
    'Industrial Byproducts',
    'Processing Waste',
  ],
}

// Generate random mock listings
function generateMockListings(count: number) {
  const listings = []
  
  // First, get all existing user IDs
  const existingUsers: string[] = []
  
  for (let i = 0; i < count; i++) {
    const category = MATERIAL_CATEGORIES[Math.floor(Math.random() * MATERIAL_CATEGORIES.length)]
    const materialName = MATERIAL_NAMES[category][Math.floor(Math.random() * MATERIAL_NAMES[category].length)]
    const condition = MATERIAL_CONDITIONS[Math.floor(Math.random() * MATERIAL_CONDITIONS.length)]
    const listingType = LISTING_TYPES[Math.floor(Math.random() * LISTING_TYPES.length)]
    const city = PAKISTAN_CITIES[Math.floor(Math.random() * PAKISTAN_CITIES.length)]
    
    const quantities = ['50 kg', '100 kg', '200 kg', '500 kg', '1 ton', '2 tons', '5 tons', '10 tons']
    const quantity = quantities[Math.floor(Math.random() * quantities.length)]
    
    const prices = listingType === 'Exchange' 
      ? [null, null, null] // Exchange listings are more likely to not have prices
      : [5000, 10000, 15000, 20000, 25000, 30000, 50000, 75000, 100000, 150000, 200000]
    const price = listingType === 'Exchange' && Math.random() < 0.7
      ? null
      : prices[Math.floor(Math.random() * prices.length)]
    
    const isExchangeOnly = listingType === 'Exchange' && Math.random() < 0.6
    
    const descriptions = [
      `High quality ${materialName.toLowerCase()} in ${condition.toLowerCase()} condition. Available for ${listingType.toLowerCase()}.`,
      `Large quantity of ${materialName.toLowerCase()} available. ${condition.toLowerCase()} condition. Suitable for recycling/repurposing.`,
      `${materialName} - ${condition} condition. Bulk quantity available. Contact for details.`,
      `Premium ${materialName.toLowerCase()} waste material. Perfect for industrial use or recycling.`,
      `${materialName} leftover from production. ${condition} quality. Ready for pickup.`,
    ]
    const description = descriptions[Math.floor(Math.random() * descriptions.length)]
    
    const locations = [
      `Industrial Area, ${city}`,
      `Main Market, ${city}`,
      `Warehouse District, ${city}`,
      `${city} Industrial Estate`,
      `Free Zone, ${city}`,
    ]
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    // Random date in last 30 days
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0)
    
    listings.push({
      material_name: materialName,
      category,
      condition,
      quantity,
      price: price ? parseFloat(price.toString()) : null,
      is_exchange_only: isExchangeOnly,
      location,
      city,
      description,
      images: [], // Images will be added manually by user
      contact_preferences: {
        call: Math.random() > 0.3,
        message: Math.random() > 0.2,
        whatsapp: Math.random() > 0.4,
      },
      status: 'active' as const,
      views_count: Math.floor(Math.random() * 500),
      listing_type: listingType,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    })
  }
  
  return listings
}

async function getOrCreateTestUsers(count: number) {
  const users: string[] = []
  
  // Try to get existing users first
  console.log('  Checking for existing users...')
  const { data: existingUsers, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .limit(count)
  
  if (fetchError) {
    console.error(`  ⚠️  Warning: Could not fetch existing users: ${fetchError.message}`)
  }
  
  if (existingUsers && existingUsers.length > 0) {
    existingUsers.forEach(user => users.push(user.id))
    console.log(`  ✅ Found ${existingUsers.length} existing user(s)`)
  } else {
    console.log('  ℹ️  No existing users found')
  }
  
  // If we need more users, create test accounts
  const usersNeeded = count - users.length
  
  if (usersNeeded > 0) {
    console.log(`  Attempting to create ${usersNeeded} new test user(s)...`)
    
    // Test if we can create users (check API key permissions)
    const testEmail = `testuser_${Date.now()}@example.com`
    const { error: testAuthError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'Test@123456',
      email_confirm: true,
    })
    
    if (testAuthError) {
      if (testAuthError.message.includes('Invalid API key')) {
        console.error('  ❌ Cannot create users: Invalid service role key')
        console.error('')
        console.error('  The SUPABASE_SERVICE_ROLE_KEY in .env.local is invalid or missing.')
        console.error('  Please check:')
        console.error('    1. You copied the "service_role" key (NOT "anon" key)')
        console.error('    2. There are no spaces or quotes around the key')
        console.error('    3. The key starts with "eyJ"')
        console.error('')
        if (users.length > 0) {
          console.log(`  ⚠️  Will use existing ${users.length} user(s) for listings`)
        } else {
          console.error('  ❌ No users available. Cannot proceed without users.')
        }
        return users
      } else {
        console.error(`  ⚠️  Warning: Cannot create users: ${testAuthError.message}`)
        if (users.length > 0) {
          console.log(`  ⚠️  Will use existing ${users.length} user(s) for listings`)
        }
        return users
      }
    }
    
    // If test succeeded, clean up and create the actual users
    for (let i = 0; i < usersNeeded; i++) {
      const testEmail = `testuser${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`
      const testPassword = 'Test@123456'
      
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true,
        })
        
        if (authError) {
          console.error(`  ❌ Failed to create user ${i + 1}/${usersNeeded}: ${authError.message}`)
          continue
        }
        
        if (!authData.user) continue
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: `Test User ${users.length + i + 1}`,
            cnic_number: `42201-${Math.floor(Math.random() * 1000000000)}-${Math.floor(Math.random() * 10)}`,
            business_name: `Test Business ${users.length + i + 1}`,
            business_type: 'Other',
            business_address: `Test Address ${users.length + i + 1}`,
            phone: `03${Math.floor(Math.random() * 100000000)}`,
            email: testEmail,
            verified: false,
            reputation_score: Math.random() * 5,
          })
        
        if (profileError) {
          console.error(`  ❌ Failed to create profile for user ${i + 1}/${usersNeeded}: ${profileError.message}`)
          continue
        }
        
        users.push(authData.user.id)
        console.log(`  ✅ Created test user ${i + 1}/${usersNeeded}`)
      } catch (error: any) {
        console.error(`  ❌ Error creating user ${i + 1}/${usersNeeded}: ${error.message}`)
      }
    }
  }
  
  return users
}

async function seedListings() {
  console.log('🚀 Starting listings seed process...\n')
  
  // Test connection first
  console.log('🔍 Testing connection to Supabase...')
  const { error: testError } = await supabase.from('profiles').select('id').limit(1)
  if (testError) {
    if (testError.message.includes('Invalid API key')) {
      console.error('❌ Error: Invalid API key detected')
      console.error('')
      console.error('The SUPABASE_SERVICE_ROLE_KEY in your .env.local file is invalid.')
      console.error('')
      console.error('Please verify:')
      console.error('  1. Go to your Supabase dashboard: Settings > API')
      console.error('  2. Copy the "service_role" key (NOT the "anon" key)')
      console.error('  3. Make sure there are no extra spaces or quotes in .env.local')
      console.error('  4. The key should look like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
      console.error('')
      process.exit(1)
    } else {
      console.error(`❌ Error connecting to Supabase: ${testError.message}`)
      process.exit(1)
    }
  }
  console.log('✅ Connection successful!\n')
  
  try {
    // Generate 50 mock listings
    const listingCount = 50
    console.log(`Generating ${listingCount} mock listings...`)
    const mockListings = generateMockListings(listingCount)
    
    // Get or create test users (we'll need at least 10-15 different users)
    // But we can work with fewer - even 1 user can have multiple listings
    const userCount = Math.min(15, Math.ceil(listingCount / 3))
    console.log(`\nGetting or creating ${userCount} test users...`)
    console.log(`(Note: We can reuse users if needed - at least 1 user is required)`)
    const userIds = await getOrCreateTestUsers(userCount)
    
    if (userIds.length === 0) {
      console.error('\n❌ No users available. Cannot create listings without users.')
      console.log('\n💡 Solutions:')
      console.log('   1. Create at least one user through the registration form at /register')
      console.log('      Then run this script again - it will use your existing user(s)')
      console.log('   2. OR fix your SUPABASE_SERVICE_ROLE_KEY to allow automatic user creation')
      console.log('      The service_role key must be from: Supabase Dashboard > Settings > API')
      console.log('      Make sure you copied the "service_role" key, NOT the "anon" key')
      console.log('')
      process.exit(1)
    }
    
    // If we have fewer users than needed, we'll reuse them
    if (userIds.length < userCount) {
      console.log(`\n⚠️  Note: Only ${userIds.length} user(s) available, will reuse them for multiple listings`)
    }
    
    console.log(`✅ Found/Created ${userIds.length} users\n`)
    
    // Assign random user IDs to listings
    const listingsWithUsers = mockListings.map(listing => ({
      ...listing,
      user_id: userIds[Math.floor(Math.random() * userIds.length)],
    }))
    
    // Insert listings in batches of 10
    console.log('Inserting listings into database...')
    const batchSize = 10
    let insertedCount = 0
    
    for (let i = 0; i < listingsWithUsers.length; i += batchSize) {
      const batch = listingsWithUsers.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('listings')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        continue
      }
      
      insertedCount += batch.length
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listingsWithUsers.length / batchSize)} (${insertedCount}/${listingsWithUsers.length} listings)`)
    }
    
    console.log(`\n🎉 Successfully seeded ${insertedCount} listings!`)
    console.log('\n📝 Note: You can now add images manually to these listings through the dashboard.')
    
  } catch (error: any) {
    console.error('❌ Error seeding listings:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the seed function
seedListings()

