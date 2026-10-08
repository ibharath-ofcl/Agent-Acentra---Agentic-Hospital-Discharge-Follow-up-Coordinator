import fs from 'fs';
const code = fs.readFileSync('src/pages/DoctorDashboard.tsx', 'utf8');

// 1. Add extracted data state safely
let newCode = code.replace(
    "const [uploadResult, setUploadResult] = useState<any>(null);",
    "const [uploadResult, setUploadResult] = useState<any>(null);\n  const [extractedData, setExtractedData] = useState<any>(null);"
);

// 2. Add useEffect for extraction fetch smartly after useEffects but before return
const insertEffectIndex = newCode.lastIndexOf("return (");
const effectHook = `
  useEffect(() => {
    if (uploadResult && !uploadResult.needsReview && uploadResult.documentId) {
      api.getExtraction(uploadResult.documentId).then(data => setExtractedData(data)).catch(e => console.error(e));
    } else {
      setExtractedData(null);
    }
  }, [uploadResult]);

  `;
newCode = newCode.slice(0, insertEffectIndex) + effectHook + newCode.slice(insertEffectIndex);

// 3. Add UI safely. It must be inside the same condition block.
const extractionUI = `
            {extractedData && (
              <div className="mt-6 border border-teal-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-teal-50 px-4 py-3 font-semibold text-teal-900 border-b border-teal-200">
                  Document Intelligence Extraction
                </div>
                <div className="p-4 space-y-4 text-sm text-slate-700">
                  <div className="flex gap-4">
                    <div className="flex-1"><strong className="text-slate-900">MRN:</strong> {extractedData.patient_mrn}</div>
                    <div className="flex-1"><strong className="text-slate-900">Name:</strong> {extractedData.patient_name}</div>
                    <div className="flex-1"><strong className="text-slate-900">Discharge:</strong> {extractedData.discharge_date}</div>
                  </div>
                  {extractedData.follow_ups && extractedData.follow_ups.length > 0 && (
                    <div>
                      <strong className="text-slate-900 block mb-1">Follow-ups:</strong>
                      <ul className="list-disc pl-5 space-y-1">
                        {extractedData.follow_ups.map((f, i) => (
                          <li key={'f'+i}>{f.specialty} ({f.appointment_date}): {f.instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {extractedData.medication_instructions && extractedData.medication_instructions.length > 0 && (
                    <div>
                      <strong className="text-slate-900 block mb-1">Medications:</strong>
                      <ul className="list-disc pl-5 space-y-1">
                        {extractedData.medication_instructions.map((m, i) => (
                          <li key={'m'+i}>{m.medication_name} - {m.instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {extractedData.source_evidence && extractedData.source_evidence.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <strong className="text-slate-500 block mb-1 text-xs uppercase tracking-wider">Source Evidence snippet:</strong>
                      <div className="bg-slate-50 p-2 rounded text-xs italic text-slate-600 border border-slate-200">
                        "{extractedData.source_evidence[0]?.extracted_text}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
`;

// At HEAD~1, the code uses my old style success box:
// {uploadResult && !uploadResult.needsReview && (
//   <div className="mt-6 bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col gap-2">
//     <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
//       <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Success
//     </div>
//     <div className="text-xs text-emerald-800 font-medium pl-2">
//       Document mapped to Patient: <strong>{uploadResult.patientName}</strong>
//     </div>
//   </div>
// )}
const successBlockIdentifier = "Document mapped to Patient: <strong>{uploadResult.patientName}</strong>";
const targetIdx = newCode.indexOf(successBlockIdentifier);
if (targetIdx !== -1) {
    const doubleEndDiv = newCode.indexOf('</div>', newCode.indexOf('</div>', targetIdx) + 1);
    const closeBraceForSuccesCondition = newCode.indexOf(')}', doubleEndDiv) + 2;
    newCode = newCode.slice(0, closeBraceForSuccesCondition) + "\n" + extractionUI + newCode.slice(closeBraceForSuccesCondition);
}

fs.writeFileSync('src/pages/DoctorDashboard.tsx', newCode);
console.log('patched flawlessly');
