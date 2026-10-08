with open('src/pages/DoctorDashboard.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('demoReminderSimulation.patientName', "(priorityList[0]?.patientName || 'Loading...')")
c = c.replace('demoReminderSimulation.currentStatus', "('Upcoming')")
c = c.replace('demoReminderSimulation.scheduledTime', "('Today, 2:00 PM')")
c = c.replace('demoReminderSimulation.purpose', "('Post-discharge routine check')")
c = c.replace('demoReminderSimulation.', "({} as any).")

c = c.replace('demoPatients', 'priorityList')

with open('src/pages/DoctorDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Fixed DoctorDashboard crash")
