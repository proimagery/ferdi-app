const fs = require('fs');

const file1 = fs.readFileSync(__dirname + '/countryDatav2.js', 'utf8');
const file2 = fs.readFileSync(__dirname + '/countryDatav2.2.js', 'utf8');

function extractVisitors(content) {
  const results = [];
  const pattern = /name:\s*'([^']+)'[\s\S]*?visitors:\s*\{\s*rank:\s*(\d+),\s*value:\s*'([^']+)'/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    let val = match[3].toLowerCase().replace(/,/g, '');
    let num = 0;
    if (val.includes('-')) {
      const parts = val.replace('m', '').split('-');
      num = (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
    } else if (val.includes('+')) {
      num = parseFloat(val.replace('m', '').replace('+', '')) || 0;
    } else if (val.endsWith('m')) {
      num = parseFloat(val.replace('m', '')) || 0;
    } else {
      num = parseFloat(val);
      if (num > 1000) num = num / 1000000;
    }
    results.push({ name: match[1], rank: parseInt(match[2]), value: match[3], numeric: num });
  }
  return results;
}

const all = [...extractVisitors(file1), ...extractVisitors(file2)];
all.sort((a, b) => a.rank - b.rank);

console.log('=== COMPLETE VISITOR RANKINGS (ALL 208 COUNTRIES) ===\n');
console.log('Rank | Country | Visitors | Numeric Value');
console.log('-----|---------|----------|---------------');

all.forEach(c => {
  console.log(`#${c.rank.toString().padStart(3)} | ${c.name.padEnd(30)} | ${c.value.padEnd(10)} | ${c.numeric.toFixed(2)}M`);
});

// Check for any out of order
console.log('\n=== CHECKING FOR ERRORS ===');
let errors = 0;
for (let i = 0; i < all.length - 1; i++) {
  if (all[i].numeric < all[i+1].numeric) {
    errors++;
    console.log(`ERROR at rank ${all[i].rank}: ${all[i].name} (${all[i].numeric.toFixed(2)}M) < ${all[i+1].name} (${all[i+1].numeric.toFixed(2)}M)`);
  }
}

if (errors === 0) {
  console.log('NO ERRORS FOUND - All rankings are in correct descending order!');
} else {
  console.log(`\nTOTAL ERRORS: ${errors}`);
}
