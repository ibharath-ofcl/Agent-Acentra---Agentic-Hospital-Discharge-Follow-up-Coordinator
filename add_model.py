with open('backend/models.py', 'r', encoding='utf-8') as f:
    text = f.read()

if 'class DischargeExtraction' not in text:
    new_model = """
class DischargeExtraction(Base):
    __tablename__ = "discharge_extractions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("discharge_documents.id"))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    structured_data = Column(String, nullable=True) # JSON string
    needs_review = Column(Boolean, default=False)
    
    document = relationship("DischargeDocument")
    patient = relationship("Patient")
"""
    text += new_model
    with open('backend/models.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Added DischargeExtraction to models.py")
else:
    print("Already exists")
