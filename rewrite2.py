import re

with open('src/pages/PatientDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'import {',
    'import {\n  Menu,\n  LayoutDashboard,\n  ListTodo,\n  CalendarClock,\n  Stethoscope,\n  ClipboardList,\n  History,\n  BellRing,\n  HelpCircle,\n  FileText,\n',
    1
)

new_state = """
  const sidebarNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plan', label: 'My Follow-ups', icon: ListTodo },
    { id: 'upcoming', label: 'Upcoming Tasks', icon: CalendarClock },
    { id: 'tests', label: 'Tests & Referrals', icon: Stethoscope },
    { id: 'instructions', label: 'Care Instructions', icon: ClipboardList },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'reminders', label: 'Reminders', icon: BellRing },
    { id: 'help', label: 'Help / Human Review', icon: HelpCircle },
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
          <div className="text-xs font-bold text-[#00e575]">Patient Portal</div>
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
          {/* Language Selector */}
          <div className="flex items-center gap-2 mb-3 bg-[#072d33] border border-[#0e4851] px-2.5 py-1.5 rounded-xl text-xs w-full">
            <Globe className="w-4 h-4 text-[#00e575] shrink-0" />
            <select
              value={selectedLanguage}
              aria-label="Select language"
              onChange={(e) => {
                setSelectedLanguage(e.target.value as any);
                setToastMessage(`Language updated to ${e.target.value}`);
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium w-full"
            >
              <option value="English" className="bg-[#052429] text-white">English</option>
              <option value="Tamil" className="bg-[#052429] text-white">தமிழ் (Tamil)</option>
              <option value="Hindi" className="bg-[#052429] text-white">हिन्दी (Hindi)</option>
            </select>
          </div>

          <button onClick={() => setActiveNav('profile')} className="flex items-center gap-2 mb-4 px-1 w-full text-left hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#00e575] text-[#052429] font-black flex items-center justify-center text-xs shrink-0">
              AK
            </div>
            <div className="text-left text-white overflow-hidden">
              <div className="font-bold text-xs truncate">{currentPatient.name}</div>
              <div className="text-[10px] text-slate-400 truncate">MRN: {currentPatient.id}</div>
            </div>
          </button>
          <Link
            to="/doctor"
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-[#00e575] bg-[#072d33] hover:bg-[#0a383f] border border-[#0e4851] rounded-lg transition-colors cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor View
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


# Extract layout parts
original_div_idx = content.find('<div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">')
head_end_idx = content.find('<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">')
main_content_end_idx = content.find('</main>')
review_modal_idx = content.find('{/* Task Details Modal */}')
last_div = content.rfind('</div>')

if original_div_idx != -1 and head_end_idx != -1:
    main_content = content[head_end_idx + len('<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">'):main_content_end_idx]
    modals = content[review_modal_idx:last_div]

    # Map conditions to new nav IDs for Patient
    # 'dashboard' -> all
    # 'plan' -> unified tasks
    # 'upcoming' -> upcoming tasks
    # 'instructions' -> medications, instructions, warnings
    # 'tests' -> part of tasks or instructions
    # 'timeline' -> timeline
    # 'reminders' -> AI reminder
    # 'help' -> needs review tasks
    
    main_content = main_content.replace(
        "activeNav === 'dashboard' || activeNav === 'plan'",
        "['dashboard', 'plan', 'upcoming', 'tests', 'help'].includes(activeNav)"
    )
    main_content = main_content.replace(
        "activeNav === 'dashboard' || activeNav === 'timeline' || activeNav === 'reminders'",
        "['dashboard', 'timeline', 'reminders', 'plan'].includes(activeNav)"
    )
    main_content = main_content.replace(
        "activeNav === 'dashboard'",
        "['dashboard', 'instructions', 'tests'].includes(activeNav)"
    )
    
    final_result = content[:original_div_idx] + new_layout + main_content + '\n        </main>\n' + modals + '\n      </div>\n    </div>\n  );\n}\n'
    
    with open('src/pages/PatientDashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(final_result)
    print('PatientDashboard rewritten successfully.')
else:
    print('Failed to locate nodes in PatientDashboard.tsx')
