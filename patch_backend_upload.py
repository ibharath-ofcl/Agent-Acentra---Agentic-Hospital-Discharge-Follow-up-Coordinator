import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Make sure we import document_parser
if 'import document_parser' not in code:
    code = code.replace('import models', 'import models\nimport document_parser\n')

# The block to replace:
old_block_start = "os.makedirs(UPLOAD_DIR, exist_ok=True)\n\n@app.post(\"/api/doctor/upload\")"

new_block = """os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/doctor/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'doctor': raise HTTPException(status_code=403)
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    ext = file.filename.split('.')[-1].lower()
    if ext not in ['pdf', 'doc', 'docx', 'xls', 'xlsx']:
        raise HTTPException(status_code=400, detail="Unsupported file format")
        
    text = document_parser.extract_text(file_path, ext)
    mrns = document_parser.find_patient_mrns(text)
    
    needs_review = False
    review_reason = None
    matched_patient = None
    
    if len(mrns) == 0:
        needs_review = True
        review_reason = "Missing patient identifier. No MRN found in document."
    elif len(mrns) > 1:
        needs_review = True
        review_reason = f"Ambiguous/conflicting patient information. Found multiple identifiers: {', '.join(mrns)}."
    else:
        mrn = mrns[0]
        matched_patient = db.query(models.Patient).filter(func.upper(models.Patient.id) == mrn).first()
        if not matched_patient:
            needs_review = True
            review_reason = f"Unknown patient identifier: {mrn}."
            
    document = models.DischargeDocument(
        patient_id=matched_patient.id if matched_patient else None,
        original_filename=file.filename,
        file_path=file_path,
        status="needs-manual-review" if needs_review else "processed",
        needs_review=needs_review,
        review_reason=review_reason
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    if needs_review:
        issue = models.NeedsReviewIssue(
            id=f"NR_DOC_{document.id}",
            patient_id=None,
            document_id=document.id,
            category="patient-matching",
            issue="Document ingestion failed confident patient matching.",
            extracted_text=",".join(mrns) if mrns else "No MRN found",
            flag_reason=review_reason,
            source=file.filename,
            page=1,
            status="active"
        )
        db.add(issue)
        db.commit()
        return {"message": "Document uploaded and flagged for review.", "documentId": document.id, "needsReview": True, "reason": review_reason, "patientName": None}
    else:
        tl = models.TimelineEvent(
            id=f"TL_DOC_{document.id}",
            patient_id=matched_patient.id,
            date_str=datetime.datetime.utcnow().strftime("%d %b"),
            title="Discharge Document Uploaded",
            description=f"File '{file.filename}' processed and mapped successfully.",
            status="completed",
            event_type="communication"
        )
        db.add(tl)
        db.commit()
        return {"message": "success", "documentId": document.id, "needsReview": False, "patientName": matched_patient.name}
"""

start_idx = code.find('os.makedirs(UPLOAD_DIR')
end_idx = code.find('# ======================= PATIENT DASHBOARD ENDPOINTS')

code = code[:start_idx] + new_block + "\n" + code[end_idx:]

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Backend upload block rewritten")
