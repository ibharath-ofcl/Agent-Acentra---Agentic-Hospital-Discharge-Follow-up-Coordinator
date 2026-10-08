const fs = require('fs');
const c = fs.readFileSync('src/pages/DoctorDashboard.tsx', 'utf8');
const splitted = c.split("activeNav === 'upload'");
const b = splitted[1].substring(0, 3000);
fs.writeFileSync('upload_branch.txt', b);
