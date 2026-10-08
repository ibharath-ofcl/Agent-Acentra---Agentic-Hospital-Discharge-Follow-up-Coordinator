import re
with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(
    r'useState\s*\(\s*DEMO_CREDENTIALS\[initialRole\]\.username\s*\)',
    r"useState(initialRole === 'doctor' ? 'doctor@acentra.com' : 'patient@acentra.com')",
    text
)
text = re.sub(
    r'useState\s*\(\s*DEMO_CREDENTIALS\[initialRole\]\.password\s*\)',
    r"useState('password')",
    text
)
text = re.sub(
    r'DEMO_CREDENTIALS\[.*?\]\.[a-zA-Z]+',
    r"''",
    text
)

with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
