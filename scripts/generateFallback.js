/**
 * Generate Fallback JSON
 *
 * Creates countryFallback.json from the local JS country data files.
 * Run this whenever you update the country data to keep the fallback in sync.
 *
 * Usage:
 * node scripts/generateFallback.js
 */

const fs = require('fs');
const path = require('path');

// Read and parse country data files
function loadCountryData() {
  const v2Path = path.join(__dirname, '../utils/countryDatav2.js');
  const v22Path = path.join(__dirname, '../utils/countryDatav2.2.js');

  // Read file contents
  let v2Content = fs.readFileSync(v2Path, 'utf8');
  let v22Content = fs.readFileSync(v22Path, 'utf8');

  // Extract the array from the export
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

// Transform to app format (camelCase with extracted ranks)
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
    mainAirports: country.mainAirports || [],
    mainTrainStations: country.mainTrainStations || [],
    topHotels: country.topHotels || [],
    avgFlightCost: country.avgFlightCost || null,
    avgTrainCost: country.avgTrainCost || null,
    bestTimeToVisit: country.bestTimeToVisit || null,
    visaRequired: country.visaRequired || null,
    rankings: country.rankings,
    // Extracted ranks for sorting
    rankVisitors: country.rankings?.visitors?.rank || null,
    rankSafety: country.rankings?.safety?.rank || null,
    rankAffordability: country.rankings?.affordability?.rank || null,
    rankFood: country.rankings?.food?.rank || null,
    rankBeaches: country.rankings?.beaches?.rank || null,
    rankMountains: country.rankings?.mountains?.rank || null,
    rankOutdoors: country.rankings?.outdoors?.rank || null,
  };
}

function generate() {
  console.log('Loading country data...');

  const countries = loadCountryData();
  console.log(`Loaded ${countries.length} countries`);

  const transformed = countries.map(transformCountry);

  // Sort by visitor rank for default ordering
  transformed.sort((a, b) => (a.rankVisitors || 999) - (b.rankVisitors || 999));

  const outputPath = path.join(__dirname, '../data/countryFallback.json');
  fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));

  console.log(`Generated ${outputPath}`);
  console.log(`Total countries: ${transformed.length}`);
}

generate();
