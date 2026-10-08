import urllib.request
import urllib.parse
import json
import os
import zipfile

# 1. Create a valid DOCX -> MRN-9281C
os.makedirs('word', exist_ok=True)
with open('word/document.xml', 'w') as f:
    f.write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Patient MRN-9281C Discharged.</w:t></w:r></w:p></w:body></w:document>')
with zipfile.ZipFile('valid.docx', 'w') as z:
    z.write('word/document.xml')

# 2. Create an ambiguous DOCX -> MRN-9281C and MRN-1002
with open('word/document.xml', 'w') as f:
    f.write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Referral MRN-9281C and MRN-1002</w:t></w:r></w:p></w:body></w:document>')
with zipfile.ZipFile('ambiguous.docx', 'w') as z:
    z.write('word/document.xml')

# 3. Create a missing XLSX -> No MRN
os.makedirs('xl', exist_ok=True)
with open('xl/sharedStrings.xml', 'w') as f:
    f.write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>No ID Here</t></si></sst>')
with zipfile.ZipFile('missing.xlsx', 'w') as z:
    z.write('xl/sharedStrings.xml')

# 4. Create an unknown PDF -> MRN-9999X
with open('unknown.pdf', 'wb') as f:
    f.write(b'%PDF-1.4\nstream\nMRN-9999X\nendstream\nEOF')

# Login
req = urllib.request.Request("http://localhost:8000/api/auth/login", data=json.dumps({"email": "doctor@acentra.com", "password": "password"}).encode('utf-8'), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
token = json.loads(res.read())['access_token']

def test_file(filename):
    with open(filename, 'rb') as f:
        file_data = f.read()
    
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        'Content-Type: application/octet-stream\r\n\r\n'
    ).encode('utf-8') + file_data + f'\r\n--{boundary}--\r\n'.encode('utf-8')
    
    req = urllib.request.Request(
        "http://localhost:8000/api/doctor/upload", 
        data=body, 
        headers={
            'Authorization': f'Bearer {token}', 
            'Content-Type': f'multipart/form-data; boundary={boundary}'
        }
    )
    r = urllib.request.urlopen(req)
    print(f"Result for {filename}: {json.loads(r.read())}")

test_file("valid.docx")
test_file("ambiguous.docx")
test_file("missing.xlsx")
test_file("unknown.pdf")

# Verify DB states
import sqlite3
conn = sqlite3.connect("backend/acentra.db")
c = conn.cursor()
print("\n--- Discharge Documents ---")
for row in c.execute("SELECT id, original_filename, patient_id, status, review_reason FROM discharge_documents ORDER BY id DESC LIMIT 4"):
    print(row)

print("\n--- Needs Review Issues ---")
for row in c.execute("SELECT id, document_id, extracted_text, flag_reason FROM needs_review_issues ORDER BY id DESC LIMIT 3"):
    print(row)

print("\n--- Timeline Events ---")
for row in c.execute("SELECT id, patient_id, title FROM timeline_events ORDER BY id DESC LIMIT 1"):
    print(row)
