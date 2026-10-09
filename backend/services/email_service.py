"""
CareFlow AI — Email Delivery & Multilingual Appointment Confirmation Service
Handles SMTP dispatch when configured; provides clean, realistic simulation logging when offline or in demo mode.
Includes multilingual appointment confirmation templates for English, Tamil, and Hindi.
"""

import os
import re
import smtplib
import uuid
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple, Optional, Dict, Any
from sqlalchemy.orm import Session

# Import models
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import models

# ==========================================
# MULTILINGUAL CONFIRMATION TEMPLATES
# ==========================================
APPOINTMENT_CONFIRMATION_TEMPLATES = {
    "en": {
        "subject": "Your appointment is confirmed",
        "header_tagline": "Appointment Care and Confirmation",
        "greeting": "Dear {patient_name},",
        "line1": "Thank you for scheduling with {clinic_name}. Your follow-up appointment has been successfully confirmed.",
        "date_label": "Appointment Date",
        "time_label": "Time",
        "doctor_label": "Doctor / Specialist",
        "dept_label": "Department",
        "location_label": "Location",
        "line2": "If diagnostic labs or fasting tests are required prior to your visit, our care team will notify you in advance.",
        "contact_line": "If any details above are incorrect or if you have questions, please call us at {clinic_phone}.",
        "closing": "With warm regards,\n{clinic_name} Care Team",
        "auto_note": "This is an automated notification from CareFlow AI. Please do not reply directly to this email."
    },
    "ta": {
        "subject": "உங்கள் சந்திப்பு உறுதி செய்யப்பட்டது",
        "header_tagline": "சந்திப்பு பராமரிப்பு மற்றும் உறுதிப்படுத்தல்",
        "greeting": "அன்புள்ள {patient_name},",
        "line1": "{clinic_name}-ல் முன்பதிவு செய்ததற்கு நன்றி. உங்கள் பின்தொடர் சந்திப்பு வெற்றிகரமாக உறுதி செய்யப்பட்டுள்ளது.",
        "date_label": "சந்திப்பு தேதி",
        "time_label": "நேரம்",
        "doctor_label": "மருத்துவர் / நிபுணர்",
        "dept_label": "துறை",
        "location_label": "இடம்",
        "line2": "வருகைக்கு முன் ஏதேனும் ஆய்வகப் பரிசோதனை தேவைப்பட்டால், எங்கள் பராமரிப்புக் குழு முன்கூட்டியே உங்களுக்கு நினைவூட்டும்.",
        "contact_line": "ஏதேனும் விவரங்கள் தவறாக இருந்தாலோ அல்லது கேள்விகள் இருந்தாலோ, தயவுசெய்து எங்களை {clinic_phone} என்ற எண்ணில் அழைக்கவும்.",
        "closing": "அன்புடன்,\n{clinic_name} பராமரிப்புக் குழு",
        "auto_note": "இது CareFlow AI தானியங்கி செய்தி. தயவுசெய்து நேரடியாகப் பதிலளிக்க வேண்டாம்."
    },
    "hi": {
        "subject": "आपका अपॉइंटमेंट पक्का हो गया है",
        "header_tagline": "अपॉइंटमेंट देखभाल और पुष्टि",
        "greeting": "प्रिय {patient_name},",
        "line1": "{clinic_name} में समय निर्धारित करने के लिए धन्यवाद। आपका फॉलो-अप अपॉइंटमेंट सफलतापूर्वक पक्का हो गया है।",
        "date_label": "अपॉइंटमेंट की तारीख",
        "time_label": "समय",
        "doctor_label": "डॉक्टर / विशेषज्ञ",
        "dept_label": "विभाग",
        "location_label": "स्थान",
        "line2": "यदि विज़िट से पहले कोई लैब जाँच या परीक्षण आवश्यक हुआ, तो हमारी टीम पहले से सूचित करेगी।",
        "contact_line": "यदि कोई विवरण सही नहीं है या आपका कोई प्रश्न है, तो कृपया हमें {clinic_phone} पर संपर्क करें।",
        "closing": "सादर,\n{clinic_name} केयर टीम",
        "auto_note": "यह CareFlow AI का एक स्वचालित संदेश है। कृपया सीधे उत्तर न दें।"
    }
}

def is_valid_email(email: Optional[str]) -> bool:
    """Validates email format."""
    if not email or not isinstance(email, str):
        return False
    email = email.strip()
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))

def normalize_language_code(lang: Optional[str]) -> str:
    """Maps various language inputs to 'en', 'ta', or 'hi'."""
    if not lang:
        return "en"
    l = lang.strip().lower()
    if l in ["ta", "tamil", "தமிழ்"]:
        return "ta"
    if l in ["hi", "hindi", "हिन्दी", "हिंदी"]:
        return "hi"
    return "en"

def send_email(
    recipient: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None,
    is_demo: bool = True
) -> Tuple[str, str, Optional[str], str]:
    """
    Attempts SMTP delivery if credentials exist; otherwise executes in safe Simulation mode.
    Returns: (status: 'sent' | 'simulated' | 'failed', provider_message_id, error_message, delivery_mode)
    """
    if not is_valid_email(recipient):
        return "failed", "", f"Invalid recipient email format: '{recipient}'", "Validation Failed"

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_EMAIL")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    from_name = os.getenv("SMTP_FROM_NAME", "CareFlow AI Coordinator")

    # If real SMTP credentials are provided, attempt real dispatch
    if smtp_host and smtp_user and smtp_pass:
        try:
            port = int(smtp_port) if smtp_port else 587
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{from_name} <{smtp_user}>"
            msg["To"] = recipient
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain", "utf-8"))
            if html_body:
                msg.attach(MIMEText(html_body, "html", "utf-8"))

            with smtplib.SMTP(smtp_host, port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)

            provider_id = f"SMTP-MSG-{uuid.uuid4().hex[:12].upper()}"
            return "sent", provider_id, None, "Real SMTP Dispatch"
        except Exception as e:
            provider_id = f"ERR-{uuid.uuid4().hex[:8].upper()}"
            return "failed", provider_id, f"SMTP Dispatch Error: {str(e)}", "SMTP Error"

    # Default Demo Simulation Provider
    provider_id = f"SIM-EMAIL-{uuid.uuid4().hex[:10].upper()}"
    return "simulated", provider_id, None, "Simulation (SMTP not configured)"

def build_appointment_confirmation_content(
    patient_name: str,
    appointment_date_str: str,
    time_str: Optional[str],
    doctor_name: Optional[str],
    department: Optional[str],
    location: Optional[str],
    language: Optional[str] = "en"
) -> Dict[str, str]:
    """
    Builds subject and body for appointment confirmation in English, Tamil, or Hindi.
    """
    lang_code = normalize_language_code(language)
    t = APPOINTMENT_CONFIRMATION_TEMPLATES.get(lang_code, APPOINTMENT_CONFIRMATION_TEMPLATES["en"])
    
    clinic_name = os.getenv("CLINIC_NAME", "CareFlow Memorial Hospital")
    clinic_phone = os.getenv("CLINIC_PHONE", "+91 800 227 3356")
    
    time_display = time_str if time_str else "10:30 AM"
    doc_display = doctor_name if doctor_name else "Care Team Specialist"
    dept_display = department if department else "Outpatient Care"
    loc_display = location if location else "CareFlow Outpatient Pavilion • Suite 204"

    greeting = t["greeting"].format(patient_name=patient_name)
    line1 = t["line1"].format(clinic_name=clinic_name)
    contact_line = t["contact_line"].format(clinic_phone=clinic_phone)
    closing = t["closing"].format(clinic_name=clinic_name)

    plain_body = f"""{t['header_tagline']}
{clinic_name}

{greeting}

{line1}

--- {t['date_label'].upper()} ---
• {t['date_label']}: {appointment_date_str}
• {t['time_label']}: {time_display}
• {t['doctor_label']}: {doc_display}
• {t['dept_label']}: {dept_display}
• {t['location_label']}: {loc_display}

{t['line2']}

{contact_line}

{closing}

---
{t['auto_note']}
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f8fa; margin: 0; padding: 20px; color: #1e293b; }}
    .card {{ max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
    .header {{ background: linear-gradient(135deg, #0a2e35 0%, #0f5c75 100%); color: #ffffff; padding: 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; }}
    .header p {{ margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; }}
    .content {{ padding: 24px; font-size: 14px; line-height: 1.6; }}
    .badge-box {{ background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 18px 0; }}
    .badge-box table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
    .badge-box td {{ padding: 6px 0; }}
    .badge-box td.label {{ color: #64748b; font-weight: 600; width: 40%; }}
    .badge-box td.val {{ color: #0f172a; font-weight: 700; }}
    .footer {{ background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 11px; color: #64748b; text-align: center; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>{clinic_name}</h1>
      <p>{t['header_tagline']}</p>
    </div>
    <div class="content">
      <p><strong>{greeting}</strong></p>
      <p>{line1}</p>
      
      <div class="badge-box">
        <table>
          <tr><td class="label">{t['date_label']}</td><td class="val">{appointment_date_str}</td></tr>
          <tr><td class="label">{t['time_label']}</td><td class="val">{time_display}</td></tr>
          <tr><td class="label">{t['doctor_label']}</td><td class="val">{doc_display}</td></tr>
          <tr><td class="label">{t['dept_label']}</td><td class="val">{dept_display}</td></tr>
          <tr><td class="label">{t['location_label']}</td><td class="val">{loc_display}</td></tr>
        </table>
      </div>

      <p>{t['line2']}</p>
      <p>{contact_line}</p>
      <p style="margin-top: 24px;">{closing.replace(chr(10), '<br>')}</p>
    </div>
    <div class="footer">
      {t['auto_note']}
    </div>
  </div>
</body>
</html>
"""

    return {
        "subject": t["subject"],
        "body": plain_body,
        "html_body": html_body,
        "language": lang_code
    }

def send_appointment_confirmation_email(
    db: Session,
    appointment: models.Appointment,
    patient: models.Patient,
    force_resend: bool = False,
    override_recipient_email: Optional[str] = None
) -> Dict[str, Any]:
    """
    Validates patient consent, formats multilingual content, triggers email delivery,
    records the NotificationLog and TimelineEvent, and returns the delivery metadata.
    Idempotent: prevents duplicate confirmation emails for the same appointment.
    """
    # If an override recipient email is provided and valid, update patient model
    if override_recipient_email and is_valid_email(override_recipient_email):
        patient.email = override_recipient_email.strip()
        if patient.user:
            patient.user.email = override_recipient_email.strip()
        db.commit()

    # 1. Idempotency Check (prevent duplicate emails for the same confirmation event)
    if not force_resend:
        existing_log = db.query(models.NotificationLog).filter(
            models.NotificationLog.appointment_id == appointment.id,
            models.NotificationLog.scenario == "appointment_booking_confirmation",
            models.NotificationLog.status.in_(["sent", "simulated"])
        ).first()

        if existing_log:
            return {
                "status": existing_log.status,
                "notificationId": existing_log.id,
                "recipientEmail": existing_log.recipient_email,
                "providerMessageId": existing_log.provider_message_id,
                "subject": existing_log.subject,
                "sentAt": existing_log.sent_at.isoformat() if existing_log.sent_at else None,
                "message": "Duplicate confirmation prevented: email already sent for this appointment."
            }

    # 2. Consent Check
    if patient.email_consent is False:
        notif_id = f"NOTIF_NOCONSENT_{appointment.id}_{uuid.uuid4().hex[:6]}"
        notif_log = models.NotificationLog(
            id=notif_id,
            patient_id=patient.id,
            appointment_id=appointment.id,
            scenario="appointment_booking_confirmation",
            channel="email",
            status="skipped",
            subject="Appointment Confirmation (Skipped - No Consent)",
            message="Email not sent because patient has disabled email communications consent.",
            provider_message_id=None,
            error_message="Patient email consent is False.",
            ai_generation_mode="consent_policy",
            recipient_email=override_recipient_email or patient.email,
            recipient_phone=patient.contact_phone,
            sent_at=None,
            is_demo=True
        )
        db.add(notif_log)
        db.commit()
        return {
            "status": "skipped",
            "notificationId": notif_id,
            "recipientEmail": override_recipient_email or patient.email,
            "providerMessageId": None,
            "subject": None,
            "message": "Email skipped: patient email consent is disabled.",
            "errorMessage": "Patient email consent is False.",
            "error": "Patient email consent is False."
        }

    # 3. Recipient Email Validation
    recipient_email = (override_recipient_email or patient.email or "").strip()
    if not is_valid_email(recipient_email):
        # Fallback to user email if available
        if patient.user and is_valid_email(patient.user.email):
            recipient_email = patient.user.email.strip()

    if not is_valid_email(recipient_email):
        notif_id = f"NOTIF_FAIL_{appointment.id}_{uuid.uuid4().hex[:6]}"
        notif_log = models.NotificationLog(
            id=notif_id,
            patient_id=patient.id,
            appointment_id=appointment.id,
            scenario="appointment_booking_confirmation",
            channel="email",
            status="failed",
            subject="Appointment Confirmation (Failed - Invalid Email)",
            message="Email delivery failed: no valid email address registered for patient.",
            provider_message_id=None,
            error_message=f"Invalid or missing recipient email for patient '{patient.id}'.",
            ai_generation_mode="validation_error",
            recipient_email=recipient_email or "MISSING",
            recipient_phone=patient.contact_phone,
            sent_at=None,
            is_demo=True
        )
        db.add(notif_log)
        db.commit()
        return {
            "status": "failed",
            "notificationId": notif_id,
            "recipientEmail": recipient_email,
            "providerMessageId": None,
            "errorMessage": "Invalid or missing recipient email address format.",
            "error": "Invalid or missing recipient email address."
        }

    # 4. Format appointment date & multilingual content
    appt_date_str = appointment.appointment_date.strftime("%d %B %Y") if appointment.appointment_date else "15 October 2026"
    content = build_appointment_confirmation_content(
        patient_name=patient.name or "Valued Patient",
        appointment_date_str=appt_date_str,
        time_str=appointment.time_str,
        doctor_name=appointment.doctor_name,
        department=appointment.department,
        location=appointment.location,
        language=patient.preferred_language
    )

    # 5. Dispatch Email (real SMTP or Simulation)
    status, provider_id, error_msg, mode = send_email(
        recipient=recipient_email,
        subject=content["subject"],
        body=content["body"],
        html_body=content["html_body"]
    )

    # 6. Save NotificationLog
    notif_id = f"NOTIF_APPT_{appointment.id}_{uuid.uuid4().hex[:6]}"
    notif_log = models.NotificationLog(
        id=notif_id,
        patient_id=patient.id,
        appointment_id=appointment.id,
        scenario="appointment_booking_confirmation",
        channel="email",
        status=status,
        subject=content["subject"],
        message=content["body"][:1000],
        provider_message_id=provider_id,
        error_message=error_msg,
        ai_generation_mode=f"multilingual_template_{content['language']}",
        recipient_email=recipient_email,
        recipient_phone=patient.contact_phone,
        sent_at=datetime.datetime.utcnow() if status in ["sent", "simulated"] else None,
        is_demo=bool(status == "simulated")
    )
    db.add(notif_log)

    # 7. Add Timeline Event
    status_label = "Sent" if status == "sent" else "Simulated" if status == "simulated" else "Failed"
    tl = models.TimelineEvent(
        id=f"TL_NOTIF_{appointment.id}_{uuid.uuid4().hex[:6]}",
        patient_id=patient.id,
        date_str=datetime.datetime.utcnow().strftime("%d %b"),
        title=f"Appointment Confirmation Email {status_label}",
        description=f"Confirmation for visit with {appointment.doctor_name or 'Specialist'} on {appt_date_str} dispatched to {recipient_email} ({content['language'].upper()}). Provider ID: {provider_id}.",
        status="completed" if status in ["sent", "simulated"] else "failed",
        event_type="notification"
    )
    db.add(tl)
    db.commit()

    return {
        "status": status,
        "notificationId": notif_id,
        "recipientEmail": recipient_email,
        "providerMessageId": provider_id,
        "subject": content["subject"],
        "language": content["language"],
        "deliveryMode": mode,
        "sentAt": notif_log.sent_at.isoformat() if notif_log.sent_at else None,
        "errorMessage": error_msg,
        "error": error_msg
    }
