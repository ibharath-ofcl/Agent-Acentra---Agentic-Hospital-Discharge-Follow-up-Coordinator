const fs = require('fs');
fs.writeFileSync('surround.txt', fs.readFileSync('src/pages/DoctorDashboard.tsx', 'utf8').substring(0, 1500));
