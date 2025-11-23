# SaudaGhar Platform

A services-based platform for buying, selling, and exchanging industrial and agricultural materials to reduce waste and promote sustainability in Pakistan.

## Tech Stack

- **Frontend & Backend**: Next.js 14+ (App Router)
- **Database & Storage**: Supabase
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js App Router pages and components
- `app/api/` - API routes
- `app/components/` - Reusable React components
- `app/lib/` - Utilities and Supabase clients
- `app/hooks/` - Custom React hooks
- `app/types/` - TypeScript type definitions

## Features

### Core Features
- User registration with CNIC and business verification
- Material listings (Buy/Sell/Exchange)
- Search and filter system
- Contact and messaging system
- User dashboard
- Rating and reputation system

### Advanced Features
- Bilingual support (English/Urdu)
- Smart matching system (mock)
- Government integration (mock)
- Waste-to-resource calculator
- Sustainability tips

## Database Setup

See the plan document for the complete database schema. You'll need to create the following tables in Supabase:
- profiles
- listings
- messages
- notifications
- ratings
- transactions

## License

MIT License - see LICENSE file for details.

