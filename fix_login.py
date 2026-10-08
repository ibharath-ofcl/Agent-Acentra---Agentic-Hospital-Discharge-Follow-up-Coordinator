import re

with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix import
text = re.sub(r'import\s+\{\s*useAuth\s*,\s*DEMO_CREDENTIALS\s*\}\s+from\s+[\'"]\.\./hooks/useAuth[\'"];?', "import { useAuth } from '../hooks/useAuth';", text)
text = re.sub(r'import\s+\{\s*useAuth\s*,\s*DEMO_CREDENTIALS\s*\}\s+from\s+[\'"]\.\./context/AuthContext[\'"];?', "import { useAuth } from '../hooks/useAuth';", text)
# Just in case it's in demoData
text = re.sub(r',\s*DEMO_CREDENTIALS', '', text)

text = text.replace('DEMO_CREDENTIALS.doctor.email', "'doctor@acentra.com'")
text = text.replace('DEMO_CREDENTIALS.doctor.password', "'password'")
text = text.replace('DEMO_CREDENTIALS.patient.email', "'patient@acentra.com'")
text = text.replace('DEMO_CREDENTIALS.patient.password', "'password'")

# Also fix the login result
text = text.replace(
    '''      const result = await login({
        username: username.trim(),
        password: password.trim(),
      });''',
    '''      const result = await login(username.trim(), password.trim());'''
)

with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated LoginPage")
