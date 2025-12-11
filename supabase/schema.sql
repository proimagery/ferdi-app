-- Supabase Database Schema for Travel Planner App
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- PROFILES TABLE
-- ============================================
-- This table stores user profile information
-- It uses the auth.users id as primary key for direct linking

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT DEFAULT '',
  location TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  twitter TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  top1 TEXT DEFAULT '',
  top2 TEXT DEFAULT '',
  top3 TEXT DEFAULT '',
  next1 TEXT DEFAULT '',
  next2 TEXT DEFAULT '',
  next3 TEXT DEFAULT '',
  avatar TEXT,
  avatar_type TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TRIPS TABLE
-- ============================================
-- Stores planned trips

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  budget DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own trips
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own trips
CREATE POLICY "Users can insert own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trips
CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own trips
CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIP COUNTRIES TABLE
-- ============================================
-- Stores countries associated with each trip

CREATE TABLE IF NOT EXISTS trip_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  country_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trip_countries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view countries for their trips
CREATE POLICY "Users can view own trip countries" ON trip_countries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_countries.trip_id AND trips.user_id = auth.uid()
    )
  );

-- Policy: Users can insert countries for their trips
CREATE POLICY "Users can insert own trip countries" ON trip_countries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_countries.trip_id AND trips.user_id = auth.uid()
    )
  );

-- Policy: Users can update countries for their trips
CREATE POLICY "Users can update own trip countries" ON trip_countries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_countries.trip_id AND trips.user_id = auth.uid()
    )
  );

-- Policy: Users can delete countries for their trips
CREATE POLICY "Users can delete own trip countries" ON trip_countries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_countries.trip_id AND trips.user_id = auth.uid()
    )
  );

-- ============================================
-- COMPLETED TRIPS TABLE
-- ============================================
-- Stores countries the user has visited

CREATE TABLE IF NOT EXISTS completed_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country TEXT NOT NULL,
  visit_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE completed_trips ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own completed trips
CREATE POLICY "Users can view own completed trips" ON completed_trips
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own completed trips
CREATE POLICY "Users can insert own completed trips" ON completed_trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own completed trips
CREATE POLICY "Users can update own completed trips" ON completed_trips
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own completed trips
CREATE POLICY "Users can delete own completed trips" ON completed_trips
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- BUDGETS TABLE
-- ============================================
-- Stores budget plans

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_name TEXT NOT NULL,
  total_budget DECIMAL DEFAULT 0,
  currency_code TEXT DEFAULT 'USD',
  currency_symbol TEXT DEFAULT '$',
  trip_duration INTEGER DEFAULT 1,
  trip_type TEXT DEFAULT 'single',
  accommodation_percent INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own budgets
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own budgets
CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own budgets
CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own budgets
CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- BUDGET CATEGORIES TABLE
-- ============================================
-- Stores expense categories for each budget

CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  budget_amount DECIMAL DEFAULT 0,
  spent DECIMAL DEFAULT 0,
  icon TEXT DEFAULT 'cash-outline',
  color TEXT DEFAULT '#4ade80',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view categories for their budgets
CREATE POLICY "Users can view own budget categories" ON budget_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()
    )
  );

-- Policy: Users can insert categories for their budgets
CREATE POLICY "Users can insert own budget categories" ON budget_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()
    )
  );

-- Policy: Users can update categories for their budgets
CREATE POLICY "Users can update own budget categories" ON budget_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()
    )
  );

-- Policy: Users can delete categories for their budgets
CREATE POLICY "Users can delete own budget categories" ON budget_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
-- This function automatically creates a profile when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_countries_trip_id ON trip_countries(trip_id);
CREATE INDEX IF NOT EXISTS idx_completed_trips_user_id ON completed_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget_id ON budget_categories(budget_id);
