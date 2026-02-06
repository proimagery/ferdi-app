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
all.sort((a, b) => b.numeric - a.numeric);

// Find all mismatches
console.log('ALL RANKING MISMATCHES:');
let errorCount = 0;
all.forEach((c, i) => {
  const expected = i + 1;
  if (c.rank !== expected) {
    errorCount++;
    console.log('#' + c.rank + ' should be #' + expected + ': ' + c.name + ' (' + c.value + ')');
  }
});

console.log('\nTotal mismatches: ' + errorCount);
console.log('Total countries: ' + all.length);
