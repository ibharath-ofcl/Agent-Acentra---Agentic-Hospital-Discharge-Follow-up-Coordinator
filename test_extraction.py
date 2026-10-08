import urllib.request
import urllib.parse
import json
import os
import zipfile

def make_docx(filename, text):
    os.makedirs('word', exist_ok=True)
    with open('word/document.xml', 'w') as f:
        f.write(f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{text}</w:t></w:r></w:p></w:body></w:document>')
    with zipfile.ZipFile(filename, 'w') as z:
        z.write('word/document.xml')

make_docx('v.docx', 'MRN-9281C TEST_MOCK_VALID')
make_docx('b1.docx', 'MRN-9281C TEST_MOCK_MISSING_DATE')
make_docx('b2.docx', 'MRN-9281C TEST_MOCK_AMBIGUOUS')
make_docx('b3.docx', 'MRN-9281C TEST_MOCK_CONFLICTING')
make_docx('b4.docx', 'MRN-9281C TEST_MOCK_MALFORMED')
make_docx('b5.docx', 'MRN-9281C TEST_MOCK_FAILURE')

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
        "http://localhost:8000/api/doctor/upload", data=body, 
        headers={'Authorization': f'Bearer {token}', 'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    r = urllib.request.urlopen(req)
    data = json.loads(r.read())
    print(f"{filename}: needsReview={data.get('needsReview')} reason={data.get('reason')}")

test_file("v.docx")
test_file("b1.docx")
test_file("b2.docx")
test_file("b3.docx")
test_file("b4.docx")
test_file("b5.docx")

import sqlite3
conn = sqlite3.connect("backend/acentra.db")
c = conn.cursor()
print("\n--- Discharge Extractions for V.docx ---")
for row in c.execute("SELECT needs_review, structured_data FROM discharge_extractions ORDER BY id DESC LIMIT 1"):
    print(f"review={row[0]} data={row[1][:100]}...")
