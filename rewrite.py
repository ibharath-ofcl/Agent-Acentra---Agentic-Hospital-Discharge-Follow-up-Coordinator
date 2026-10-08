import re
import os

with open('src/pages/DoctorDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'import {',
    'import {\n  Menu,\n  UploadCloud,\n  FileText,\n  LayoutDashboard,\n  ListTodo,\n',
    1
)

new_state = """
  const sidebarNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'upload', label: 'Document Upload', icon: UploadCloud },
    { id: 'followup', label: 'Follow-up Tasks', icon: ListTodo },
    { id: 'review', label: 'Needs Human Review', icon: AlertTriangle },
    { id: 'priority', label: 'Priority Queue', icon: ClockAlert },
    { id: 'reminders', label: 'Reminders', icon: PhoneCall },
    { id: 'timeline', label: 'Timeline / Audit', icon: Clock },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
"""

content = re.sub(
    r"const \[activeNav, setActiveNav\].*?;",
    f"const [activeNav, setActiveNav] = useState('dashboard');\n{new_state}",
    content
)

new_layout = """    <div className="flex bg-[#f8fafc] text-slate-900 min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] bg-[#052429] border border-[#00e575] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#052429] border-r border-[#0e4851] flex-shrink-0 fixed inset-y-0 z-40">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#0e4851]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429] font-black">
              <Activity className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-base tracking-tight text-white line-clamp-1">
              CareFlow <span className="text-[#00e575]">AI</span>
            </span>
          </Link>
        </div>
        
        <div className="px-5 py-3 border-b border-[#0e4851]">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Role</div>
          <div className="text-xs font-bold text-[#00e575]">Coordinator Command</div>
        </div>

        <nav className="flex-1 overflow-y-auto hide-scrollbar py-4 px-3 space-y-1">
          {sidebarNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeNav === item.id
                  ? 'bg-[#00e575] text-[#052429]'
                  : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#0e4851] space-y-2">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-8 h-8 rounded-full bg-[#0a383f] text-[#00e575] border border-[#145e69] font-black flex items-center justify-center text-xs shrink-0">
              MP
            </div>
            <div className="text-left text-white overflow-hidden">
              <div className="font-bold text-xs truncate">Dr. Meera Patel</div>
              <div className="text-[10px] text-slate-400 truncate">Coordinator</div>
            </div>
          </div>
          <Link
            to="/patient"
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-[#00e575] bg-[#072d33] hover:bg-[#0a383f] border border-[#0e4851] rounded-lg transition-colors"
          >
            <User className="w-3.5 h-3.5" /> Patient View
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-slate-300 bg-transparent hover:bg-red-950/40 hover:text-red-400 border border-transparent rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#052429] text-white border-b border-[#0e4851] h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 text-slate-300 hover:text-white rounded-lg focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429] font-black">
                <Activity className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                CareFlow <span className="text-[#00e575]">AI</span>
              </span>
            </Link>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-slate-300 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Sidebar Off-canvas */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#052429] border-r border-[#0e4851] flex flex-col"
              >
                <div className="h-16 flex items-center justify-between px-5 border-b border-[#0e4851]">
                  <span className="font-bold text-base tracking-tight text-white">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-300 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {sidebarNav.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveNav(item.id); setMobileMenuOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                        activeNav === item.id
                          ? 'bg-[#00e575] text-[#052429]'
                          : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20">"""

doc_upload_jsx = """
        {(activeNav === 'upload') && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto mt-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-200">
                <UploadCloud className="w-5 h-5 text-teal-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Upload Clinical Document</h2>
                <p className="text-xs text-slate-500">Securely ingest Discharge Summaries for AI Extraction</p>
              </div>
            </div>
            
            <label className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" />
              <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:shadow-md transition-shadow">
                <FileText className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Click to select or drag and drop</h3>
              <p className="text-xs text-slate-500 mb-4">Supported formats: PDF, DOCX, XLS, XLSX</p>
              <div className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors">
                Select File
              </div>
            </label>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <p>This is a frontend demonstration interface. Uploaded documents will not be sent to any backend AI processing engine during Phase 1.</p>
            </div>
          </div>
        )}
"""

# Extract layout parts
original_div_idx = content.find('<div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">')
head_end_idx = content.find('<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">')
main_content_end_idx = content.find('</main>')
review_modal_idx = content.find('{/* Review Modal (for resolving Needs Human Review queue items) */}')
last_div = content.rfind('</div>')

if original_div_idx != -1 and head_end_idx != -1:
    main_content = content[head_end_idx + len('<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">'):main_content_end_idx]
    modals = content[review_modal_idx:last_div]

    main_content = main_content.replace(
        "activeNav === 'dashboard' || activeNav === 'priority'",
        "activeNav === 'dashboard' || activeNav === 'priority' || activeNav === 'followup'"
    )
    main_content = main_content.replace(
        "activeNav === 'dashboard' || activeNav === 'escalations' || activeNav === 'activity'",
        "activeNav === 'dashboard' || activeNav === 'reminders' || activeNav === 'timeline' || activeNav === 'followup'"
    )
    main_content = main_content.replace(
        "activeNav === 'dashboard' || activeNav === 'review'",
        "activeNav === 'dashboard' || activeNav === 'review' || activeNav === 'followup'"
    )

    final_result = content[:original_div_idx] + new_layout + main_content + doc_upload_jsx + '\n        </main>\n' + modals + '\n      </div>\n    </div>\n  );\n}\n'
    
    with open('src/pages/DoctorDashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(final_result)
    print('DoctorDashboard rewritten successfully.')
else:
    print('Failed to locate nodes in DoctorDashboard.tsx')
