-- Supabase SQL: Create countries table for Ferdi app
-- Run this in Supabase Dashboard > SQL Editor

-- Create the countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  flag VARCHAR(10) NOT NULL,
  continent VARCHAR(50) NOT NULL,
  population VARCHAR(20),
  capital VARCHAR(100),
  leader VARCHAR(200),
  language VARCHAR(200),
  currency VARCHAR(50),
  highlights JSONB DEFAULT '[]',
  main_airports JSONB DEFAULT '[]',
  main_train_stations JSONB DEFAULT '[]',
  top_hotels JSONB DEFAULT '[]',
  avg_flight_cost VARCHAR(50),
  avg_train_cost VARCHAR(100),
  best_time_to_visit TEXT,
  visa_required TEXT,
  rankings JSONB NOT NULL,
  -- Extracted ranks for efficient sorting (indexed columns)
  rank_visitors INTEGER,
  rank_safety INTEGER,
  rank_affordability INTEGER,
  rank_food INTEGER,
  rank_beaches INTEGER,
  rank_mountains INTEGER,
  rank_outdoors INTEGER,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for sorting by each ranking category
CREATE INDEX IF NOT EXISTS idx_countries_rank_visitors ON countries(rank_visitors) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_countries_rank_safety ON countries(rank_safety) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_countries_rank_affordability ON countries(rank_affordability) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_countries_rank_food ON countries(rank_food) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_countries_rank_beaches ON countries(rank_beaches) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_countries_rank_mountains ON countries(rank_mountains) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_countries_rank_outdoors ON countries(rank_outdoors) WHERE is_active = true;

-- Index for name lookups and search
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Public read access policy (anyone can read active countries)
CREATE POLICY "Countries are publicly readable"
  ON countries
  FOR SELECT
  USING (is_active = true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at on changes
DROP TRIGGER IF EXISTS update_countries_updated_at ON countries;
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant public read access
GRANT SELECT ON countries TO anon;
GRANT SELECT ON countries TO authenticated;
