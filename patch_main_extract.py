import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Add import
if 'import extraction_service' not in text:
    text = text.replace('import document_parser', 'import document_parser\nimport extraction_service')

# Hook into upload_document after the Document and NeedsReviewIssue code block finishes
# Find where it returns success:
success_return = """        tl = models.TimelineEvent(
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
        return {"message": "success", "documentId": document.id, "needsReview": False, "patientName": matched_patient.name}"""

new_success_return = """        tl = models.TimelineEvent(
            id=f"TL_DOC_{document.id}",
            patient_id=matched_patient.id,
            date_str=datetime.datetime.utcnow().strftime("%d %b"),
            title="Discharge Document Uploaded & Extracted",
            description=f"File '{file.filename}' processed, mapped, and structured successfully.",
            status="completed",
            event_type="communication"
        )
        db.add(tl)
        db.commit()
        
        # --- PHASE 3 STEP 2 HOOK ---
        # Document successfully matches patient, now we attempt LLM extraction
        ext_record, ext_reasons = extraction_service.process_document_extraction(db, text, document, matched_patient)
        
        if document.needs_review:
             # It got flagged during extraction
             return {"message": "Document flagged during extraction review.", "documentId": document.id, "needsReview": True, "reason": document.review_reason, "patientName": matched_patient.name}
             
        return {"message": "success", "documentId": document.id, "needsReview": False, "patientName": matched_patient.name, "extractionId": ext_record.id}
"""

text = text.replace(success_return, new_success_return)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated main.py")
