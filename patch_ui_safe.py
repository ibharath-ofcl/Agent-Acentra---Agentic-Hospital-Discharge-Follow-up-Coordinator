with open('src/pages/DoctorDashboard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. State
text = text.replace("const [uploadResult, setUploadResult] = useState<any>(null);", "const [uploadResult, setUploadResult] = useState<any>(null);\n  const [extractedData, setExtractedData] = useState<any>(null);")

# 2. Effect
effect = """
  useEffect(() => {
    if (uploadResult && !uploadResult.needsReview && uploadResult.documentId) {
      api.getExtraction(uploadResult.documentId).then(data => setExtractedData(data)).catch(e => console.error(e));
    } else {
      setExtractedData(null);
    }
  }, [uploadResult]);
"""
text = text.replace('return (', effect + '\n  return (', 1)

# 3. UI
# I will find the end of `!uploadResult.needsReview` block
idx = text.find('Successfully mapped to Patient:')
if idx != -1:
    end_div_idx = text.find('</div>', text.find('</div>', text.find('</div>', idx) + 1) + 1) + 6
    # So we found the end of the success box
    # let's inject after the closing `)}`
    close_brace_idx = text.find(')}', end_div_idx) + 2

    # Safer injection:
    extraction_ui = """
            {extractedData && (
              <div className="mt-6 border border-teal-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-teal-50 px-4 py-3 font-semibold text-teal-900 border-b border-teal-200">
                  Document Intelligence Extraction
                </div>
                <div className="p-4 space-y-4 text-sm text-slate-700">
                  <div className="flex gap-4">
                    <div className="flex-1"><strong className="text-slate-900">MRN:</strong> {extractedData.patient_mrn}</div>
                    <div className="flex-1"><strong className="text-slate-900">Discharge:</strong> {extractedData.discharge_date}</div>
                  </div>
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
"""
    text = text[:close_brace_idx] + extraction_ui + text[close_brace_idx:]

with open('src/pages/DoctorDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Safely patched DoctorDashboard.tsx")
