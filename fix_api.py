with open('backend/main.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('"patientName": p.name,', '"patientName": p.name,\n            "name": p.name,')

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
