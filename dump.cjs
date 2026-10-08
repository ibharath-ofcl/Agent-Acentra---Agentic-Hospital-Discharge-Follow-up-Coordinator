const fs = require('fs');
const lines = fs.readFileSync('src/pages/DoctorDashboard.tsx', 'utf8').split('\n');
console.log(JSON.stringify(lines.slice(0, 50), null, 2));
