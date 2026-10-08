from pydantic import BaseModel, root_validator
from typing import List, Optional, Any, Dict
import datetime

class ExtractionFollowUp(BaseModel):
    specialty: Optional[str] = None
    appointment_date: Optional[str] = None
    instruction: Optional[str] = None

class ExtractionTest(BaseModel):
    test_name: Optional[str] = None
    date: Optional[str] = None
    instruction: Optional[str] = None

class ExtractionReferral(BaseModel):
    specialty: Optional[str] = None
    referral_date: Optional[str] = None
    instruction: Optional[str] = None

class ExtractionMedication(BaseModel):
    medication_name: str
    instruction: str
    duration: Optional[str] = None

class ExtractionCare(BaseModel):
    wound_care: Optional[str] = None
    diet: Optional[str] = None
    rehabilitation: Optional[str] = None
    activity: Optional[str] = None

class StructuredExtraction(BaseModel):
    patient_mrn: Optional[str] = None
    patient_name: Optional[str] = None
    discharge_date: Optional[str] = None
    follow_ups: List[ExtractionFollowUp] = []
    tests: List[ExtractionTest] = []
    referrals: List[ExtractionReferral] = []
    medication_instructions: List[ExtractionMedication] = []
    care_instructions: List[ExtractionCare] = []
    warning_signs: List[str] = []
    follow_up_deadlines: List[str] = []
    source_evidence: List[Dict[str, Any]] = []

    # Validations are handled gracefully in the service layer, 
    # but Pydantic guarantees field type stability.
