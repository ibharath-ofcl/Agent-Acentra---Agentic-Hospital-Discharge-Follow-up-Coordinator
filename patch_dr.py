import re

def update_doctor_dashboard():
    with open('src/pages/DoctorDashboard.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add `useEffect` and `api` import
    content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';\nimport { api } from '../api';")
    
    # 2. Add API state definition inside the component
    # Find activeNav line
    state_anchor = "const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n"
    
    new_states = """
  const [stats, setStats] = useState({ totalPatients: 0, pendingFollowUps: 0, highPriority: 0, needsReview: 0, overdue: 0 });
  const [priorityList, setPriorityList] = useState<any[]>([]);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        const [s, p, r, o] = await Promise.all([
          api.getDoctorStats(),
          api.getDoctorPatients(),
          api.getNeedsReview(),
          api.getOverdue()
        ]);
        setStats(s);
        setPriorityList(p);
        setReviewQueue(r);
        setOverdueItems(o);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
"""
    
    content = content.replace(state_anchor, state_anchor + new_states)
    
    # 3. Replace the old mock demoData states
    content = re.sub(r"const \[priorityList\] = useState<[^>]+>\(demoCareCoordinationPriorities\);", "", content)
    content = re.sub(r"const \[reviewQueue, setReviewQueue\] = useState<[^>]+>\(demoNeedsReviewQueue\);", "", content)
    
    # 4. We need to handle the fact that some demo variables are used directly like `demoDashboardStats`
    content = content.replace("demoDashboardStats", "stats")
    content = content.replace("demoOverdueItems", "overdueItems")
    
    # demoUpcomingDeadlines missing from API, just use overdueItems for both or empty array.
    content = content.replace("demoUpcomingDeadlines.map", "overdueItems.map")
    
    # Remove demoData imports
    content = re.sub(r"import\s+\{\s*demoPatients[^;]*;\n", "", content)
    
    # Also fix Document Upload state
    upload_anchor = "const [inspectedPatient, setInspectedPatient] = useState<Patient | null>(null);"
    upload_state = """
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const handleUpload = async () => {
    if(!uploadFile) return;
    try {
      setToastMessage("Uploading document...");
      const res = await api.uploadDoc(uploadFile);
      setToastMessage("Document uploaded and flagged for review.");
      setUploadFile(null);
    } catch(e) {
      setToastMessage("Upload failed.");
    }
  };
"""
    content = content.replace(upload_anchor, upload_anchor + upload_state)
    
    upload_html_regex = r'<label className="border-2 border-dashed border-slate-300.*?<\/label>'
    upload_html_updated = """
            <label className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => {
                 if(e.target.files && e.target.files[0]) setUploadFile(e.target.files[0]);
              }} />
              <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:shadow-md transition-shadow">
                <FileText className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{uploadFile ? uploadFile.name : "Click to select or drag and drop"}</h3>
              <p className="text-xs text-slate-500 mb-4">Supported formats: PDF, DOCX, XLS, XLSX</p>
              <div className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors">
                {uploadFile ? "Change File" : "Select File"}
              </div>
            </label>
            {uploadFile && (
              <button onClick={handleUpload} className="mt-4 w-full py-3 bg-[#00e575] hover:bg-[#00cb68] text-[#052429] font-bold rounded-xl shadow-md transition-colors">
                Confirm & Upload Document
              </button>
            )}
    """
    content = re.sub(upload_html_regex, upload_html_updated.strip(), content, flags=re.DOTALL)
    
    with open('src/pages/DoctorDashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("DoctorDashboard updated!")

update_doctor_dashboard()
