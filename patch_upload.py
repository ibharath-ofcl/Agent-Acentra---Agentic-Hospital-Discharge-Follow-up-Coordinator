with open('src/pages/DoctorDashboard.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'setToastMessage("Document uploaded and flagged for review.");',
    'setUploadResult(res); setToastMessage("Document uploaded successfully.");'
)

c = c.replace(
    'const [uploadFile, setUploadFile] = useState<File | null>(null);',
    'const [uploadFile, setUploadFile] = useState<File | null>(null);\n  const [uploadResult, setUploadResult] = useState<any>(null);'
)

warnJSX = """Confirm & Upload Document
              </button>
            )}
            
            {uploadResult && (
              <div className="mt-6 bg-red-50/80 border border-red-300 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600" /> ⚠ Needs Manual Correction
                </div>
                <div className="text-xs text-red-800 font-medium pl-2">
                  <strong className="block mb-1">Reason:</strong>
                  "Patient identifier could not be confidently matched."
                </div>
                <div className="text-[11px] text-slate-500 mt-2 pl-2">Document ID: {uploadResult.documentId}</div>
              </div>
            )}
            """

c = c.replace(
    """Confirm & Upload Document
              </button>
            )}""",
    warnJSX
)

with open('src/pages/DoctorDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
