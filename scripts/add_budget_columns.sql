-- Migration: Add columns to budgets table for complete budget data storage
-- Run this in Supabase SQL Editor

-- Add budget_data column to store complete budget object as JSON
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS budget_data JSONB;

-- Add country_name column for single-country budgets
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS country_name TEXT;

-- Add accommodation_amount column (actual dollar amount instead of just percent)
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS accommodation_amount NUMERIC DEFAULT 0;

-- Create index on budget_data for faster JSON queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_budgets_budget_data ON budgets USING GIN (budget_data);

-- Verify the changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'budgets';
