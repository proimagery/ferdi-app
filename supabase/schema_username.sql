-- Username Feature Schema for Travel Planner App
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- ADD USERNAME COLUMN TO PROFILES
-- ============================================
-- Add unique username column to profiles table

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================
-- FUNCTION: Check username availability
-- ============================================
-- This function checks if a username is available

CREATE OR REPLACE FUNCTION public.check_username_available(check_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(check_username)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE RLS POLICY FOR USERNAME CHECKS
-- ============================================
-- Allow users to check if usernames are available (read other profiles' usernames)

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can check username availability" ON profiles;

CREATE POLICY "Users can check username availability" ON profiles
  FOR SELECT USING (true);

-- Note: This allows SELECT on profiles for all authenticated users
-- which is needed for username availability checks and viewing other profiles
