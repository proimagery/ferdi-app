-- Add image columns to countries table for country and attraction photos
-- Run this in Supabase Dashboard > SQL Editor

-- Add header image URL column
ALTER TABLE countries ADD COLUMN IF NOT EXISTS header_image_url TEXT;

-- Add attraction images as JSONB (maps attraction name to image URL)
-- Example: {"Eiffel Tower": "https://...", "Louvre": "https://..."}
ALTER TABLE countries ADD COLUMN IF NOT EXISTS attraction_images JSONB DEFAULT '{}';

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'countries'
AND column_name IN ('header_image_url', 'attraction_images');
