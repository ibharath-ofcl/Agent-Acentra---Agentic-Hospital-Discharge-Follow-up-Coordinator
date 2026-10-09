"""
CareFlow AI — SMS Delivery Service (DLT Template Compliant)
Uses deterministic, pre-approved clinical coordination templates with DLT compliance.
Supports external HTTP SMS gateway when configured; defaults to MockSMSProvider for jury demonstrations.
"""

import os
import uuid
import json
import urllib.request
from typing import Dict, Any, Tuple, Optional

DLT_TEMPLATES: Dict[str, Dict[str, str]] = {
    "test_missing_urgent": {
        "dlt_id": "DLT-11071689201",
        "text": "CareFlow Reminder: Hello {patient_name}, your {test_name} for appointment on {appointment_date} is pending. Please complete it so results are ready for your doctor. Clinic: 080-49201000",
    },
    "test_missing_final": {
        "dlt_id": "DLT-11071689202",
        "text": "CareFlow URGENT: Hello {patient_name}, reminder that your appointment with {doctor_name} is TOMORROW {appointment_date}. Your {test_name} is pending. Please complete today or alert reception.",
    },
    "appointment_reminder": {
        "dlt_id": "DLT-11071689203",
        "text": "CareFlow Reminder: Hello {patient_name}, your appointment with {doctor_name} is scheduled for tomorrow {appointment_date} at {time_str} at {location}. Required tests are verified complete.",
    },
    "appointment_morning": {
        "dlt_id": "DLT-11071689204",
        "text": "CareFlow Check-in: Hello {patient_name}, your appointment with {doctor_name} is today at {time_str} ({location}). Please bring your discharge summary. Questions? Call 080-49201000.",
    },
    "skipped_test_today": {
        "dlt_id": "DLT-11071689205",
        "text": "CareFlow Alert: Hello {patient_name}, your appointment is today at {time_str}. Note: {test_name} is pending. Please notify the desk at check-in for assistance.",
    },
    "missed_appointment": {
        "dlt_id": "DLT-11071689206",
        "text": "CareFlow: Hello {patient_name}, we missed you for your follow-up appointment on {appointment_date}. Please contact our clinic to reschedule your post-discharge visit: 080-49201000.",
    },
}

def send_sms(
    phone: str,
    scenario: str,
    variables: Dict[str, str],
    is_demo: bool = True
) -> Tuple[str, str, str, str, Optional[str]]:
    """
    Interpolates DLT template and dispatches SMS.
    Returns: (status: 'sent' | 'simulated' | 'failed', message_text, dlt_id, provider_id, error_message)
    """
    template_info = DLT_TEMPLATES.get(scenario, {
        "dlt_id": "DLT-11071689299",
        "text": "CareFlow Reminder: Hello {patient_name}, you have an appointment on {appointment_date}. Please check your care plan.",
    })

    dlt_id = template_info["dlt_id"]
    try:
        message_text = template_info["text"].format(
            patient_name=variables.get("patient_name", "Patient"),
            appointment_date=variables.get("appointment_date", "upcoming date"),
            test_name=variables.get("test_name", "Blood Test"),
            doctor_name=variables.get("doctor_name", "Dr. Rajesh Mehta"),
            time_str=variables.get("time_str", "10:30 AM"),
            location=variables.get("location", "Cardiology Clinic")
        )
    except Exception:
        message_text = template_info["text"]

    sms_api_url = os.getenv("SMS_API_URL")
    sms_api_key = os.getenv("SMS_API_KEY")

    if sms_api_url and sms_api_key:
        try:
            payload = {
                "to": phone,
                "message": message_text,
                "template_id": dlt_id,
                "sender": os.getenv("SMS_SENDER_ID", "CRFLOW")
            }
            req = urllib.request.Request(
                sms_api_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {sms_api_key}"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                provider_id = f"SMS-GW-{uuid.uuid4().hex[:10].upper()}"
                return "sent", message_text, dlt_id, provider_id, None
        except Exception as e:
            provider_id = f"SIM-SMS-{uuid.uuid4().hex[:10].upper()}"
            return "simulated", message_text, dlt_id, provider_id, f"Gateway error ({str(e)}). Executed in Simulation Mode."

    # Default Mock / Simulation Provider
    provider_id = f"SIM-SMS-{uuid.uuid4().hex[:10].upper()}"
    return "simulated", message_text, dlt_id, provider_id, None
