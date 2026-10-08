with open('src/pages/PatientDashboard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('(profile).', '(profile || {})?.')

with open('src/pages/PatientDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("done")
