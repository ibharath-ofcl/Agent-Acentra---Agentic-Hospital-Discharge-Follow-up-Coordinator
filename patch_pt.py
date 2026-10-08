import re

def update_patient_dashboard():
    with open('src/pages/PatientDashboard.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace(
        "import { useState } from 'react';", 
        "import { useState, useEffect } from 'react';\nimport { api } from '../api';"
    )

    state_anchor = "const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n"
    
    new_states = """
  const [profile, setProfile] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        const [me, tsk, tl] = await Promise.all([
          api.getPatientMe(),
          api.getPatientTasks(),
          api.getPatientTimeline()
        ]);
        setProfile(me);
        setTaskList(tsk);
        setTimeline(tl);
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

    content = re.sub(r"const \[taskList, setTaskList\] = useState<[^>]+>\(demoFollowUpTasks\);", "const [taskList, setTaskList] = useState<any[]>([]);", content)
    content = re.sub(r"const \[timeline, setTimeline\] = useState\(demoTimelineMilestones\);", "", content)
    
    content = re.sub(r"currentPatient\.name", "(profile?.name || 'Loading...')", content)
    content = re.sub(r"currentPatient\.id", "(profile?.id || '---')", content)
    content = re.sub(r"currentPatient", "(profile)", content)

    # Remove demoData imports
    content = re.sub(r"import\s+\{\s*currentPatient[^;]*;\n", "", content)

    # Empty states for missing items
    content = content.replace("demoMedications.map", "[]?.map")
    content = content.replace("demoCareInstructions.map", "[]?.map")
    content = content.replace("demoWarnings.map", "[]?.map")
    content = content.replace("demoReminderSimulation.patientName", "(profile?.name)")
    content = content.replace("demoReminderSimulation.", "({} as any).")

    with open('src/pages/PatientDashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("PatientDashboard updated!")

update_patient_dashboard()
