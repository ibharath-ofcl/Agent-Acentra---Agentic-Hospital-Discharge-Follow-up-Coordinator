const fs = require('fs');
const c = fs.readFileSync('src/pages/DoctorDashboard.tsx', 'utf8');
const splitted = c.split("{uploadResult && !uploadResult.needsReview && (");
if (splitted.length > 1) {
    console.log(splitted[1].substring(0, 2500));
}
