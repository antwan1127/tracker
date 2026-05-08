# Location Tracker Setup Guide

## Prerequisites
- Node.js installed
- Netlify account
- Supabase account (free tier available)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Create a new project
3. In the project dashboard, go to **SQL Editor**
4. Create a new table with this SQL:

```sql
CREATE TABLE locations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);

-- Create an index for faster queries
CREATE INDEX idx_locations_created_at ON locations(created_at DESC);
```

5. Copy your **Project URL** and **Anon Key** from Settings → API

## Step 2: Set Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Deploy to Netlify

1. Push your changes to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify:
   - Go to **Site Settings → Build & Deploy → Environment**
   - Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## Step 4: Test Locally

```bash
npm install
netlify dev
```

Open `http://localhost:3000` and click "Share My Location" to test.

## Viewing Saved Locations

1. Go to Supabase dashboard
2. Open **SQL Editor** or **Table Editor**
3. Select the `locations` table to see all saved locations
