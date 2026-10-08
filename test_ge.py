import sqlite3
conn = sqlite3.connect("backend/acentra.db")
c = conn.cursor()
row = c.execute("SELECT document_id FROM discharge_extractions ORDER BY id DESC LIMIT 1").fetchone()
if not row:
    print("Database is empty of extractions!")
else:
    doc_id = row[0]
    import urllib.request
    import json
    req = urllib.request.Request("http://localhost:8000/api/auth/login", data=json.dumps({"email": "doctor@acentra.com", "password": "password"}).encode('utf-8'), headers={'Content-Type': 'application/json'})
    token = json.loads(urllib.request.urlopen(req).read())['access_token']
    req2 = urllib.request.Request(f"http://localhost:8000/api/doctor/extraction/{doc_id}", headers={'Authorization': f'Bearer {token}'})
    try:
        print(urllib.request.urlopen(req2).read().decode('utf-8'))
    except Exception as e:
        print(e)
