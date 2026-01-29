# Ghost Rider Apex Operations

A cyberpunk-themed client portal and admin dashboard for trucking compliance management.

## Features

- **Client Portal**: Tier-based access to ELD reports, IFTA records, CSA scores, and more
- **Admin Dashboard**: Complete client management and report generation
- **Service Tiers**: Wingman, Guardian, Apex Command, Virtual Dispatcher, and more
- **Secure Authentication**: Row-level security with Supabase
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Ghost-Rider-Apex-Ops-v4-test-copilot-ai
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

### 3. Set Up Database

1. Go to your Supabase SQL Editor
2. Run the database schema (contact admin for schema file)
3. Create the client creation function (contact admin for function)

### 4. Create Admin Account

1. Sign up at `/login` with your admin email
2. Run the admin bootstrap SQL (contact admin for script)

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Service Tiers

- **Wingman**: ELD reports + support tickets
- **Guardian**: ELD + IFTA + Driver Files + support
- **Apex Command**: All Guardian features + CSA Scores + DataQ disputes
- **Virtual Dispatcher**: Load scheduling + broker packets + revenue reports
- **A La Carte**: Custom access to specific reports
- **ELD Monitoring Only**: Monthly ELD reports only
- **Back Office Command**: All features + DOT audits
- **DOT Readiness Audit**: DOT compliance audits

## Admin Features

- Create and manage client accounts
- Generate reports for all service tiers
- View all client data and support tickets
- Manage user access and permissions

## Security

- Row Level Security (RLS) ensures clients only see their own data
- Admin-only access to management features
- Secure authentication with Supabase Auth
- Environment variables protect sensitive keys

## Support

For technical support or questions, contact the development team.