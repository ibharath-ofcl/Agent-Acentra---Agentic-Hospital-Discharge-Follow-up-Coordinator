const fs = require('fs');
const c = fs.readFileSync('src/pages/DoctorDashboard.tsx', 'utf8');
const p1 = c.indexOf('const handleUpload');
const p2 = c.indexOf('} catch', p1);
fs.writeFileSync('upload.txt', c.substring(p1, p2 + 20));
