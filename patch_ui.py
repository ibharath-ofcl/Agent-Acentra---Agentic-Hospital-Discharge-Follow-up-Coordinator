with open('src/pages/DoctorDashboard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# I will replace the '{uploadResult && (' block using pure regex or string matching.
start_idx = text.find('{uploadResult && (')
end_idx = text.find('</div>\n            )}', start_idx) + 21

warnJSX = """{uploadResult && uploadResult.needsReview && (
              <div className="mt-6 bg-red-50/80 border border-red-300 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600" /> ⚠ Needs Manual Correction
                </div>
                <div className="text-xs text-red-800 font-medium pl-2">
                  <strong className="block mb-1">Reason:</strong>
                  {uploadResult.reason || "Patient identifier could not be confidently matched."}
                </div>
                <div className="text-[11px] text-slate-500 mt-2 pl-2">Document ID: {uploadResult.documentId}</div>
              </div>
            )}
            {uploadResult && !uploadResult.needsReview && (
              <div className="mt-6 bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Document Mapped Structure
                </div>
                <div className="text-xs text-emerald-800 font-medium pl-2">
                  Successfully mapped to Patient: <strong>{uploadResult.patientName}</strong>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 pl-2">Document ID: {uploadResult.documentId}</div>
              </div>
            )}"""

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + warnJSX + text[end_idx:]

with open('src/pages/DoctorDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("UI updated")
