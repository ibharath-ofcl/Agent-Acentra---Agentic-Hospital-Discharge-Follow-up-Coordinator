with open('backend/main.py', 'r', encoding='utf-8') as f:
    text = f.read()

new_endpoint = """
@app.get("/api/doctor/extraction/{document_id}")
async def get_extraction(document_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403)
    ext = db.query(models.DischargeExtraction).filter(models.DischargeExtraction.document_id == document_id).first()
    if not ext:
        raise HTTPException(status_code=404, detail="Extraction not found")
    import json
    return json.loads(ext.structured_data) if ext.structured_data else {}
"""
if "/api/doctor/extraction/" not in text:
    text += new_endpoint
    with open('backend/main.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Added GET endpoint")
