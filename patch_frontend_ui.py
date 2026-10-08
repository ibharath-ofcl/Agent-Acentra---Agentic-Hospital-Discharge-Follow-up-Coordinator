with open('src/pages/DoctorDashboard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. State addition
if 'const [extractedData, setExtractedData] = useState<any>(null);' not in text:
    state_block = "const [uploadResult, setUploadResult] = useState<any>(null);\n  const [extractedData, setExtractedData] = useState<any>(null);"
    text = text.replace("const [uploadResult, setUploadResult] = useState<any>(null);", state_block)

# 2. Fetch logic
fetch_effect = """
  useEffect(() => {
    if (uploadResult && !uploadResult.needsReview && uploadResult.documentId) {
      api.getExtraction(uploadResult.documentId).then(data => setExtractedData(data)).catch(e => console.error(e));
    } else {
      setExtractedData(null);
    }
  }, [uploadResult]);
"""
if 'getExtraction(' not in text:
    # insert before return (
    text = text.replace('return (', fetch_effect + '\n  return (', 1)

# 3. UI addition
extraction_ui = """
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
                  
                  {extractedData.follow_ups?.length > 0 && (
                    <div>
                      <strong className="text-slate-900 block mb-1">Follow-ups:</strong>
                      <ul className="list-disc pl-5 space-y-1">
                        {extractedData.follow_ups.map((f:any, i:number) => (
                          <li key={'f'+i}>{f.specialty} ({f.appointment_date}): {f.instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {extractedData.medication_instructions?.length > 0 && (
                    <div>
                      <strong className="text-slate-900 block mb-1">Medications:</strong>
                      <ul className="list-disc pl-5 space-y-1">
                        {extractedData.medication_instructions.map((m:any, i:number) => (
                          <li key={'m'+i}>{m.medication_name} - {m.instruction} ({m.duration || 'no explicit duration'})</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {extractedData.care_instructions?.length > 0 && (
                    <div>
                      <strong className="text-slate-900 block mb-1">Care Instructions:</strong>
                      <ul className="list-disc pl-5 space-y-1">
                        {extractedData.care_instructions.map((c:any, i:number) => (
                          <li key={'c'+i}>{c.wound_care} | {c.diet} | {c.activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {extractedData.warning_signs?.length > 0 && (
                    <div>
                      <strong className="text-slate-900 block mb-1">Warning Signs (Return to ER if):</strong>
                      <div className="bg-rose-50 text-rose-900 px-3 py-2 rounded">
                        {extractedData.warning_signs.join(", ")}
                      </div>
                    </div>
                  )}

                  {extractedData.source_evidence?.length > 0 && (
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
"""

if 'Document Intelligence Extraction' not in text:
    text = text.replace('{uploadResult && !uploadResult.needsReview && (', '{uploadResult && !uploadResult.needsReview && (' + '\n' + '            <!-- success box -->' + '\n', 1)
    # Insert safely after the emerald success box
    text = text.replace('Document Mapped Structure\n                </div>\n                <div className="text-xs text-emerald-800 font-medium pl-2">\n                  Successfully mapped to Patient: <strong>{uploadResult.patientName}</strong>\n                </div>\n                <div className="text-[11px] text-slate-500 mt-2 pl-2">Document ID: {uploadResult.documentId}</div>\n              </div>\n            )}', 
    'Document Mapped Structure\n                </div>\n                <div className="text-xs text-emerald-800 font-medium pl-2">\n                  Successfully mapped to Patient: <strong>{uploadResult.patientName}</strong>\n                </div>\n                <div className="text-[11px] text-slate-500 mt-2 pl-2">Document ID: {uploadResult.documentId}</div>\n              </div>\n            )}\n' + extraction_ui)

with open('src/pages/DoctorDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("UI Extracted data updated")
