const fs = require('fs');
const path = require('path');

console.log(JSON.parse(fs.readFileSync(path.join(__dirname, '../dev-data/data', 'tours-simple.json'))));