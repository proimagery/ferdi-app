/**
 * Migration Script: Populate Supabase countries table
 *
 * Prerequisites:
 * 1. Run create_countries_table.sql in Supabase first
 * 2. Install dependencies: npm install @supabase/supabase-js
 *
 * Usage:
 * node scripts/migrateCountries.js YOUR_SERVICE_ROLE_KEY
 *
 * Get your service_role key from:
 * Supabase Dashboard > Settings > API > service_role (secret)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://scsjeuneadnnxpeneoae.supabase.co';

// Service role key is required for write operations (bypasses RLS)
// Pass it as a command line argument: node migrateCountries.js YOUR_SERVICE_ROLE_KEY
const serviceRoleKey = process.argv[2];

if (!serviceRoleKey) {
  console.error('Error: Service role key is required.');
  console.error('');
  console.error('Usage: node scripts/migrateCountries.js YOUR_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Get your service_role key from:');
  console.error('Supabase Dashboard > Settings > API > service_role (secret)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Read and parse country data files
function loadCountryData() {
  const v2Path = path.join(__dirname, '../utils/countryDatav2.js');
  const v22Path = path.join(__dirname, '../utils/countryDatav2.2.js');

  // Read file contents
  let v2Content = fs.readFileSync(v2Path, 'utf8');
  let v22Content = fs.readFileSync(v22Path, 'utf8');

  // Extract the array from the export
  // The files export arrays like: export const countriesPartOne = [...]
  v2Content = v2Content.replace('export const countriesPartOne = ', 'module.exports = ');
  v22Content = v22Content.replace('export const countriesPartTwo = ', 'module.exports = ');

  // Write temporary CommonJS versions
  const tempV2Path = path.join(__dirname, 'temp_v2.js');
  const tempV22Path = path.join(__dirname, 'temp_v22.js');

  fs.writeFileSync(tempV2Path, v2Content);
  fs.writeFileSync(tempV22Path, v22Content);

  // Require the temporary files
  const countriesPartOne = require(tempV2Path);
  const countriesPartTwo = require(tempV22Path);

  // Clean up temp files
  fs.unlinkSync(tempV2Path);
  fs.unlinkSync(tempV22Path);

  return [...countriesPartOne, ...countriesPartTwo];
}

// Transform country data for Supabase
function transformCountry(country) {
  return {
    name: country.name,
    flag: country.flag,
    continent: country.continent,
    population: country.population || null,
    capital: country.capital || null,
    leader: country.leader || null,
    language: country.language || null,
    currency: country.currency || null,
    highlights: country.highlights || [],
    main_airports: country.mainAirports || [],
    main_train_stations: country.mainTrainStations || [],
    top_hotels: country.topHotels || [],
    avg_flight_cost: country.avgFlightCost || null,
    avg_train_cost: country.avgTrainCost || null,
    best_time_to_visit: country.bestTimeToVisit || null,
    visa_required: country.visaRequired || null,
    rankings: country.rankings,
    // Extract individual ranks for indexing/sorting
    rank_visitors: country.rankings?.visitors?.rank || null,
    rank_safety: country.rankings?.safety?.rank || null,
    rank_affordability: country.rankings?.affordability?.rank || null,
    rank_food: country.rankings?.food?.rank || null,
    rank_beaches: country.rankings?.beaches?.rank || null,
    rank_mountains: country.rankings?.mountains?.rank || null,
    rank_outdoors: country.rankings?.outdoors?.rank || null,
    is_active: true
  };
}

async function migrate() {
  console.log('Loading country data from local files...');

  let countries;
  try {
    countries = loadCountryData();
    console.log(`Loaded ${countries.length} countries from local files`);
  } catch (error) {
    console.error('Error loading country data:', error.message);
    process.exit(1);
  }

  console.log('\nMigrating to Supabase...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const country of countries) {
    const record = transformCountry(country);

    const { error } = await supabase
      .from('countries')
      .upsert(record, {
        onConflict: 'name',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`✗ Failed: ${country.name} - ${error.message}`);
      errorCount++;
    } else {
      console.log(`✓ ${country.name}`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Migration complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${countries.length}`);
}

// Run migration
migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
