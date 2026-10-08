const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');
const hook = `export const api = {
  getExtraction: async (docId: number) => {
    const response = await fetch("http://localhost:8000/api/doctor/extraction/" + docId, {
      headers: { ...getHeaders() }
    });
    if (!response.ok) throw new Error("Failed");
    return response.json();
  },`;
code = code.replace('export const api = {', hook);
fs.writeFileSync('src/api.ts', code);
