"""
CareFlow AI — Patient Email Content Generator
Uses Google Gemini API to craft concise, warm, professional patient reminders.
Includes deterministic, robust zero-latency fallback templates if Gemini API is unreachable or rate-limited.
"""

import os
import json
import urllib.request
import urllib.error
import ssl
from typing import Dict, Any, Tuple

try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except Exception:
    try:
        SSL_CONTEXT = ssl.create_default_context()
    except Exception:
        SSL_CONTEXT = ssl._create_unverified_context()

FALLBACK_EMAIL_TEMPLATES = {
    "test_missing_early": {
        "subject": "Early reminder: Upcoming appointment and pending test",
        "body": "Hello {first_name},\n\nThis is a friendly reminder that your follow-up appointment with {doctor_name} is scheduled for {appointment_date}. A required test ({test_name}) is currently pending in your care plan. Please complete this test before your appointment so your doctor can review the results with you.\n\nIf you have any questions or need assistance scheduling your test, please contact our clinic.\n\nWarm regards,\nCareFlow Coordination Team"
    },
    "test_missing_urgent": {
        "subject": "Action needed: Required {test_name} for upcoming appointment",
        "body": "Hello {first_name},\n\nYour appointment is coming up in 3 days on {appointment_date}. Our records indicate that your {test_name} has not yet been completed. To ensure your doctor has your test results ready during your visit, please arrange to complete this test promptly.\n\nIf you have already completed this test, or if you need help, please let the clinic know.\n\nSincerely,\nCareFlow Care Team"
    },
    "test_missing_final": {
        "subject": "Important: Urgent test reminder for tomorrow's appointment",
        "body": "Hello {first_name},\n\nYour appointment with {doctor_name} is tomorrow, {appointment_date}. Your required {test_name} is still pending. Having these results is important for your consultation. Please complete the test today or contact the clinic reception immediately upon arrival.\n\nIf you need assistance, call the clinic right away.\n\nBest regards,\nCareFlow Team"
    },
    "skipped_test_today": {
        "subject": "Today's Appointment: Notice regarding pending {test_name}",
        "body": "Hello {first_name},\n\nWe look forward to seeing you today ({appointment_date}) for your appointment. Please inform the front desk during check-in that your {test_name} is still pending so the clinical team can assist you.\n\nSee you soon,\nCareFlow Team"
    },
    "missed_appointment": {
        "subject": "We missed you at your appointment",
        "body": "Hello {first_name},\n\nWe missed you at your scheduled appointment on {appointment_date}. Continuing your post-discharge recovery is very important. Please contact our clinic at your earliest convenience to reschedule.\n\nWarm regards,\nCareFlow Patient Care Team"
    },
    "default": {
        "subject": "Reminder regarding your upcoming appointment",
        "body": "Hello {first_name},\n\nThis is a reminder regarding your upcoming appointment on {appointment_date}. Please review your care plan and complete any pending requirements.\n\nIf you have questions, please contact the clinic.\n\nRegards,\nCareFlow"
    }
}

def generate_email_content(
    scenario: str,
    first_name: str,
    appointment_date_str: str,
    test_name: str = "Blood Test",
    doctor_name: str = "Dr. Rajesh Mehta",
    language: str = "English"
) -> Tuple[Dict[str, str], str]:
    """
    Calls Gemini API to generate structured patient email.
    Returns: ({ "subject": str, "body": str }, generation_mode: 'gemini_ai' | 'fallback_template')
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return get_fallback_email(scenario, first_name, appointment_date_str, test_name, doctor_name), "fallback_template"

    prompt = f"""
You are the CareFlow AI Patient Communication Assistant.
Generate a concise, warm, professional patient reminder email.

CONTEXT:
- Scenario: {scenario}
- Patient First Name: {first_name}
- Appointment Date: {appointment_date_str}
- Doctor / Specialist: {doctor_name}
- Required Diagnostic Test: {test_name}
- Language: {language}

STRICT SAFETY RULES:
1. Maximum 90 words.
2. Do NOT provide medical diagnosis or prognosis.
3. Do NOT recommend or change medications.
4. Do NOT interpret medical results.
5. Do NOT invent medical instructions.
6. Tell the patient to contact the clinic if they have questions.
7. Return ONLY valid JSON with keys "subject" and "body".

Example JSON structure:
{{"subject": "Your Upcoming Appointment Reminder", "body": "Hello Ravi..."}}
"""

    models_to_try = [
        ("v1", "gemini-2.5-flash"),
        ("v1beta", "gemini-flash-latest"),
        ("v1", "gemini-1.5-flash")
    ]

    for api_version, model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=8, context=SSL_CONTEXT) as response:
                if response.status == 200:
                    resp_data = json.loads(response.read().decode("utf-8"))
                    candidates = resp_data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed = json.loads(content_text)
                        if "subject" in parsed and "body" in parsed:
                            return parsed, "gemini_ai"
        except Exception:
            continue

    # If all Gemini attempts fail, return robust fallback template
    return get_fallback_email(scenario, first_name, appointment_date_str, test_name, doctor_name), "fallback_template"

def get_fallback_email(
    scenario: str,
    first_name: str,
    appointment_date_str: str,
    test_name: str,
    doctor_name: str
) -> Dict[str, str]:
    tpl = FALLBACK_EMAIL_TEMPLATES.get(scenario, FALLBACK_EMAIL_TEMPLATES["default"])
    return {
        "subject": tpl["subject"].format(
            first_name=first_name,
            appointment_date=appointment_date_str,
            test_name=test_name,
            doctor_name=doctor_name
        ),
        "body": tpl["body"].format(
            first_name=first_name,
            appointment_date=appointment_date_str,
            test_name=test_name,
            doctor_name=doctor_name
        )
    }
