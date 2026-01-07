-- Leaderboard RLS Policies Update
-- Run this SQL in your Supabase SQL Editor to enable the global leaderboard
-- These policies allow authenticated users to view all profiles and completed trips
-- while maintaining security for insert/update/delete operations

-- ============================================
-- PROFILES TABLE - Add public read access
-- ============================================

-- Policy: All authenticated users can view all profiles (for search, leaderboard, buddies)
CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- COMPLETED TRIPS TABLE - Add public read access
-- ============================================

-- Policy: All authenticated users can view all completed trips (for leaderboard stats)
CREATE POLICY "Authenticated users can view all completed trips" ON completed_trips
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- Note: The existing policies for INSERT, UPDATE, DELETE remain unchanged
-- Users can still only modify their own data
-- ============================================
