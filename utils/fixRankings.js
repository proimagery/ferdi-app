// Script to fix ALL rankings across all country data files
const fs = require('fs');
const path = require('path');

// Parse different value formats to numeric
function parseValue(value, category) {
  if (!value) return 0;
  const str = String(value).toLowerCase().replace(/,/g, '');

  // Handle visitor counts (M = millions)
  if (category === 'visitors') {
    if (str.includes('-')) {
      const parts = str.replace('m', '').split('-');
      return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    }
    if (str.includes('+')) return parseFloat(str.replace('m', '').replace('+', '')) || 0;
    if (str.endsWith('m')) return parseFloat(str.replace('m', '')) || 0;
    const num = parseFloat(str);
    return num > 1000 ? num / 1000000 : num;
  }

  // Handle ratings like "8.5/10" or just "8.5"
  if (['safety', 'food', 'beaches', 'mountains', 'outdoors'].includes(category)) {
    const match = str.match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // Handle affordability (text-based, convert to score - higher is more affordable)
  if (category === 'affordability') {
    if (str.includes('very affordable') || str.includes('budget')) return 9;
    if (str.includes('affordable')) return 7;
    if (str.includes('moderate-affordable')) return 6;
    if (str.includes('moderate')) return 5;
    if (str.includes('moderate-expensive')) return 4;
    if (str.includes('expensive') && !str.includes('very')) return 3;
    if (str.includes('very expensive')) return 1;
    return 5; // default to moderate
  }

  return parseFloat(str) || 0;
}

// Categories to fix (higher value = better rank for all except affordability where we want affordable to rank higher)
const categories = ['visitors', 'safety', 'food', 'beaches', 'mountains', 'outdoors', 'affordability'];

// Read both data files
const file1Path = path.join(__dirname, 'countryDatav2.js');
const file2Path = path.join(__dirname, 'countryDatav2.2.js');

let file1Content = fs.readFileSync(file1Path, 'utf8');
let file2Content = fs.readFileSync(file2Path, 'utf8');

// Extract country data for each category
function extractCategoryData(content, category, fileName) {
  const results = [];

  // Match country name and the specific category ranking
  const pattern = new RegExp(
    `name:\\s*'([^']+)'[\\s\\S]*?${category}:\\s*\\{\\s*rank:\\s*(\\d+),\\s*value:\\s*'([^']+)'`,
    'g'
  );

  let match;
  while ((match = pattern.exec(content)) !== null) {
    results.push({
      name: match[1],
      currentRank: parseInt(match[2]),
      value: match[3],
      numericValue: parseValue(match[3], category),
      file: fileName
    });
  }

  return results;
}

// Process each category
console.log('=== FIXING ALL RANKING CATEGORIES ===\n');

let totalChanges = 0;

categories.forEach(category => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Processing: ${category.toUpperCase()}`);
  console.log('='.repeat(50));

  // Extract data from both files
  const file1Data = extractCategoryData(file1Content, category, 'v2');
  const file2Data = extractCategoryData(file2Content, category, 'v2.2');
  const allCountries = [...file1Data, ...file2Data];

  if (allCountries.length === 0) {
    console.log(`No data found for ${category}`);
    return;
  }

  // Sort by value (higher is better for all categories)
  allCountries.sort((a, b) => b.numericValue - a.numericValue);

  // Assign new ranks
  allCountries.forEach((country, index) => {
    country.newRank = index + 1;
  });

  // Count changes
  const changes = allCountries.filter(c => c.currentRank !== c.newRank);
  totalChanges += changes.length;

  console.log(`Total countries: ${allCountries.length}`);
  console.log(`Countries needing rank changes: ${changes.length}`);

  // Show top 10 and some notable changes
  console.log(`\nTop 10 for ${category}:`);
  allCountries.slice(0, 10).forEach(c => {
    const changed = c.currentRank !== c.newRank ? ` (was #${c.currentRank})` : '';
    console.log(`  #${c.newRank}: ${c.name} - ${c.value}${changed}`);
  });

  if (changes.length > 0) {
    console.log(`\nSome significant changes:`);
    changes.slice(0, 5).forEach(c => {
      console.log(`  ${c.name}: #${c.currentRank} → #${c.newRank} (${c.value})`);
    });
  }

  // Update file contents
  allCountries.forEach(country => {
    const pattern = new RegExp(
      `(name:\\s*'${country.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?${category}:\\s*\\{\\s*rank:\\s*)${country.currentRank}(,\\s*value:)`,
      'g'
    );

    if (country.file === 'v2') {
      file1Content = file1Content.replace(pattern, `$1${country.newRank}$2`);
    } else {
      file2Content = file2Content.replace(pattern, `$1${country.newRank}$2`);
    }
  });
});

// Write updated files
fs.writeFileSync(file1Path, file1Content, 'utf8');
fs.writeFileSync(file2Path, file2Content, 'utf8');

console.log(`\n${'='.repeat(50)}`);
console.log(`COMPLETE! Total rank corrections: ${totalChanges}`);
console.log('='.repeat(50));
