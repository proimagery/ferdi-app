-- Additional Social Features Schema for Travel Planner App
-- Run this SQL in your Supabase SQL Editor after the main schema

-- ============================================
-- TRAVEL BUDDIES TABLE
-- ============================================
-- Stores friend connections between users

CREATE TABLE IF NOT EXISTS travel_buddies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  buddy_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  is_highlighted BOOLEAN DEFAULT false, -- For showing on profile (max 3)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, buddy_id)
);

-- Enable Row Level Security
ALTER TABLE travel_buddies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own buddy relationships
CREATE POLICY "Users can view own buddies" ON travel_buddies
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Policy: Users can send buddy requests
CREATE POLICY "Users can send buddy requests" ON travel_buddies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their buddy relationships
CREATE POLICY "Users can update own buddy relationships" ON travel_buddies
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Policy: Users can delete their buddy relationships
CREATE POLICY "Users can delete own buddy relationships" ON travel_buddies
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- ============================================
-- VISITED CITIES TABLE
-- ============================================
-- Stores cities the user has visited

CREATE TABLE IF NOT EXISTS visited_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  visit_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE visited_cities ENABLE ROW LEVEL SECURITY;

-- Policies for visited_cities
CREATE POLICY "Users can view own visited cities" ON visited_cities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visited cities" ON visited_cities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visited cities" ON visited_cities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visited cities" ON visited_cities
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- UPDATE PROFILES TABLE FOR PHOTOS
-- ============================================
-- Add travel_photos column to profiles if not exists

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'travel_photos'
  ) THEN
    ALTER TABLE profiles ADD COLUMN travel_photos TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'shared_trip_maps'
  ) THEN
    ALTER TABLE profiles ADD COLUMN shared_trip_maps UUID[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'youtube'
  ) THEN
    ALTER TABLE profiles ADD COLUMN youtube TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'x'
  ) THEN
    ALTER TABLE profiles ADD COLUMN x TEXT DEFAULT '';
  END IF;
END $$;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_travel_buddies_user_id ON travel_buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_buddies_buddy_id ON travel_buddies(buddy_id);
CREATE INDEX IF NOT EXISTS idx_visited_cities_user_id ON visited_cities(user_id);
