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

// Show ranks around Slovenia (56), Azerbaijan (80), and Belize (142)
console.log('Ranks 54-58 (around Slovenia):');
all.filter(c => c.rank >= 54 && c.rank <= 58).forEach(c =>
  console.log(`  #${c.rank}: ${c.name} - ${c.value} (${c.numeric.toFixed(2)}M)`)
);

console.log('\nRanks 78-82 (around Azerbaijan):');
all.filter(c => c.rank >= 78 && c.rank <= 82).forEach(c =>
  console.log(`  #${c.rank}: ${c.name} - ${c.value} (${c.numeric.toFixed(2)}M)`)
);

console.log('\nRanks 140-144 (around Belize):');
all.filter(c => c.rank >= 140 && c.rank <= 144).forEach(c =>
  console.log(`  #${c.rank}: ${c.name} - ${c.value} (${c.numeric.toFixed(2)}M)`)
);

// Full list sorted by rank to check order
console.log('\n=== CHECKING FOR ANY OUT-OF-ORDER RANKINGS ===');
let errors = 0;
for (let i = 0; i < all.length - 1; i++) {
  if (all[i].numeric < all[i+1].numeric) {
    errors++;
    console.log(`ERROR: #${all[i].rank} ${all[i].name} (${all[i].value}) has FEWER visitors than #${all[i+1].rank} ${all[i+1].name} (${all[i+1].value})`);
  }
}
if (errors === 0) {
  console.log('All rankings are in correct order!');
}
