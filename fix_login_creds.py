import re
with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('DEMO_CREDENTIALS.doctor.username', "'doctor@acentra.com'")
text = text.replace('DEMO_CREDENTIALS.patient.username', "'patient@acentra.com'")
text = text.replace('DEMO_CREDENTIALS.doctor.password', "'password'")
text = text.replace('DEMO_CREDENTIALS.patient.password', "'password'")

with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
