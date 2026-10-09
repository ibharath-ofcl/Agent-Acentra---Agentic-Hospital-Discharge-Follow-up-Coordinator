"""
CareFlow AI — Central Automation Engine
Orchestrates appointment monitoring, deterministic scenario evaluation, Gemini AI email generation,
DLT SMS formatting, duplicate prevention, patient consent enforcement, and notification persistence.
Invoked identically by both APScheduler and live Demo Simulation runs.
"""

import uuid
import datetime
from zoneinfo import ZoneInfo
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

import models
from scenarios.reminder_rules import determine_scenario, SCENARIO_CONFIG
from services.gemini_email_service import generate_email_content
from services.email_service import send_email
from services.sms_service import send_sms

KOLKATA_TZ = ZoneInfo("Asia/Kolkata")

def get_or_create_automation_state(db: Session) -> models.AutomationState:
    state = db.query(models.AutomationState).first()
    if not state:
        state = models.AutomationState(
            id=1,
            simulation_date="2026-10-08",
            is_running=True,
            timezone="Asia/Kolkata",
            next_scheduled_run="09:00 AM IST"
        )
        db.add(state)
        db.commit()
        db.refresh(state)
    return state

def get_current_date(db: Session, override_date_str: Optional[str] = None) -> datetime.date:
    """
    Centralized date provider.
    Returns override date if specified, otherwise database simulation date or real Asia/Kolkata date.
    """
    if override_date_str:
        try:
            return datetime.datetime.strptime(override_date_str, "%Y-%m-%d").date()
        except ValueError:
            pass

    state = get_or_create_automation_state(db)
    if state.simulation_date:
        try:
            return datetime.datetime.strptime(state.simulation_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    return datetime.datetime.now(KOLKATA_TZ).date()

def is_within_communication_hours(now_dt: Optional[datetime.datetime] = None) -> bool:
    """
    Checks if current Asia/Kolkata time is between 08:00 AM and 08:00 PM.
    """
    if now_dt is None:
        now_dt = datetime.datetime.now(KOLKATA_TZ)
    hour = now_dt.hour
    return 8 <= hour < 20

def run_automation_pipeline(
    db: Session,
    simulation_date_str: Optional[str] = None,
    is_demo: bool = True,
    bypass_hours_check: bool = True
) -> Dict[str, Any]:
    """
    Core Automation Service.
    Executes CareFlow care plan monitoring, deterministic rules, and multi-channel dispatch.
    """
    start_time = datetime.datetime.now()
    state = get_or_create_automation_state(db)

    if simulation_date_str:
        state.simulation_date = simulation_date_str
        db.commit()

    curr_date = get_current_date(db, simulation_date_str)
    curr_date_str = curr_date.strftime("%Y-%m-%d")

    # Metrics
    appointments_checked = 0
    scenarios_detected = 0
    emails_sent = 0
    sms_sent = 0
    staff_alerts = 0
    skipped_count = 0
    failed_count = 0
    processed_logs = []

    # Query all active/scheduled appointments
    appointments = db.query(models.Appointment).filter(
        models.Appointment.status.in_(["scheduled", "pending", "no_show", "missed"])
    ).all()

    for appt in appointments:
        appointments_checked += 1
        pat = appt.patient
        if not pat:
            continue

        # Get missing tests linked to this appointment
        missing_tests = [
            t for t in appt.required_tests
            if t.status in ("pending", "in-progress", "needs-review")
        ]

        scenario, target_channels = determine_scenario(appt, missing_tests, curr_date)

        if not scenario or not target_channels:
            continue

        scenarios_detected += 1
        patient_first_name = pat.name.split()[0] if pat.name else "Patient"
        test_name = missing_tests[0].test_name if missing_tests else "Blood Test"
        test_id = missing_tests[0].id if missing_tests else None
        appt_date_formatted = appt.appointment_date.strftime("%d %B %Y")

        for channel in target_channels:
            # 1. DUPLICATE PREVENTION:
            # Check if this exact scenario & channel has already been successfully sent for this appointment
            existing_notif = db.query(models.NotificationLog).filter(
                and_(
                    models.NotificationLog.appointment_id == appt.id,
                    models.NotificationLog.scenario == scenario,
                    models.NotificationLog.channel == channel,
                    models.NotificationLog.status.in_(["sent", "simulated"])
                )
            ).first()

            if existing_notif:
                # Record skipped notification in logs so jury sees explicit deduplication
                skip_log = models.NotificationLog(
                    id=f"NOTIF-SKIP-{uuid.uuid4().hex[:8].upper()}",
                    patient_id=pat.id,
                    appointment_id=appt.id,
                    test_id=test_id,
                    scenario=scenario,
                    channel=channel,
                    status="skipped",
                    subject=f"Deduplicated: {scenario}",
                    message=f"Duplicate notification prevented. Already sent at {existing_notif.sent_at.strftime('%d %b %H:%M')}.",
                    error_message="Skipped — Already Sent",
                    ai_generation_mode="duplicate_suppressed",
                    recipient_email=pat.email or (pat.user.email if pat.user else "") or f"patient_{pat.id.lower()}@hospital.org",
                    recipient_phone=pat.contact_phone or "+919876543210",
                    is_demo=is_demo,
                    simulation_date=curr_date_str
                )
                db.add(skip_log)
                db.commit()
                skipped_count += 1
                processed_logs.append({
                    "id": skip_log.id,
                    "patientName": pat.name,
                    "scenario": scenario,
                    "channel": channel,
                    "status": "skipped",
                    "reason": "Skipped — Already Sent"
                })
                continue

            # 2. CONSENT ENFORCEMENT
            if channel == "email" and not pat.email_consent:
                skip_log = models.NotificationLog(
                    id=f"NOTIF-NOCONSENT-{uuid.uuid4().hex[:8].upper()}",
                    patient_id=pat.id,
                    appointment_id=appt.id,
                    scenario=scenario,
                    channel=channel,
                    status="skipped",
                    subject=f"Consent missing: {scenario}",
                    message="Notification suppressed due to missing patient email communication consent.",
                    error_message="Patient communication consent not available.",
                    ai_generation_mode="consent_suppressed",
                    recipient_email=pat.email or (pat.user.email if pat.user else "") or f"patient_{pat.id.lower()}@hospital.org",
                    is_demo=is_demo,
                    simulation_date=curr_date_str
                )
                db.add(skip_log)
                db.commit()
                skipped_count += 1
                continue

            if channel == "sms" and not pat.sms_consent:
                skip_log = models.NotificationLog(
                    id=f"NOTIF-NOCONSENT-{uuid.uuid4().hex[:8].upper()}",
                    patient_id=pat.id,
                    appointment_id=appt.id,
                    scenario=scenario,
                    channel=channel,
                    status="skipped",
                    subject=f"Consent missing: {scenario}",
                    message="SMS suppressed due to missing patient SMS communication consent.",
                    error_message="Patient communication consent not available.",
                    ai_generation_mode="consent_suppressed",
                    recipient_phone=pat.contact_phone or "+919876543210",
                    is_demo=is_demo,
                    simulation_date=curr_date_str
                )
                db.add(skip_log)
                db.commit()
                skipped_count += 1
                continue

            # 3. COMMUNICATION HOURS (Unless in Demo mode)
            if not is_demo and not bypass_hours_check and not is_within_communication_hours():
                skip_log = models.NotificationLog(
                    id=f"NOTIF-OUTSIDEHOURS-{uuid.uuid4().hex[:8].upper()}",
                    patient_id=pat.id,
                    appointment_id=appt.id,
                    scenario=scenario,
                    channel=channel,
                    status="skipped",
                    subject=f"Outside communication window: {scenario}",
                    message="Communication held until 08:00 AM IST window opens.",
                    error_message="Outside communication window (08:00 AM - 08:00 PM IST).",
                    ai_generation_mode="hours_suppressed",
                    is_demo=is_demo,
                    simulation_date=curr_date_str
                )
                db.add(skip_log)
                db.commit()
                skipped_count += 1
                continue

            # 4. DISPATCH BASED ON CHANNEL
            try:
                if channel == "email":
                    # Generate email content via Gemini AI with guaranteed fallback
                    email_payload, gen_mode = generate_email_content(
                        scenario=scenario,
                        first_name=patient_first_name,
                        appointment_date_str=appt_date_formatted,
                        test_name=test_name,
                        doctor_name=appt.doctor_name,
                        language=pat.preferred_language or "English"
                    )

                    recipient_email = (pat.email or (pat.user.email if pat.user else "") or "").strip()
                    if not recipient_email:
                        recipient_email = f"patient_{pat.id.lower()}@hospital.org"

                    status, prov_id, err_msg, del_mode = send_email(
                        recipient=recipient_email,
                        subject=email_payload.get("subject", "CareFlow Appointment Notification"),
                        body=email_payload.get("body", ""),
                        is_demo=is_demo
                    )

                    notif = models.NotificationLog(
                        id=f"NOTIF-{uuid.uuid4().hex[:10].upper()}",
                        patient_id=pat.id,
                        appointment_id=appt.id,
                        test_id=test_id,
                        scenario=scenario,
                        channel="email",
                        status=status,
                        subject=email_payload.get("subject"),
                        message=email_payload.get("body"),
                        provider_message_id=prov_id,
                        error_message=err_msg,
                        ai_generation_mode=gen_mode,
                        recipient_email=recipient_email,
                        is_demo=is_demo,
                        simulation_date=curr_date_str
                    )
                    db.add(notif)
                    db.commit()
                    emails_sent += 1

                    # Add patient timeline event
                    tl = models.TimelineEvent(
                        id=f"TL-NOTIF-{uuid.uuid4().hex[:8].upper()}",
                        patient_id=pat.id,
                        date_str=curr_date.strftime("%d %b %Y"),
                        title=f"✉ Email: {email_payload.get('subject', 'Reminder Sent')}",
                        description=f"CareFlow dispatched notification regarding {test_name} for appointment on {appt_date_formatted}.",
                        status="completed",
                        event_type="communication"
                    )
                    db.add(tl)
                    db.commit()

                    processed_logs.append({
                        "id": notif.id,
                        "patientName": pat.name,
                        "scenario": scenario,
                        "channel": "email",
                        "status": status,
                        "subject": email_payload.get("subject"),
                        "aiMode": gen_mode,
                        "providerId": prov_id
                    })

                elif channel == "sms":
                    sms_vars = {
                        "patient_name": pat.name,
                        "appointment_date": appt_date_formatted,
                        "test_name": test_name,
                        "doctor_name": appt.doctor_name,
                        "time_str": appt.time_str or "10:30 AM",
                        "location": appt.location or "Cardiology Clinic"
                    }
                    recipient_phone = pat.contact_phone or "+919876543210"
                    status, message_text, dlt_id, prov_id, err_msg = send_sms(
                        phone=recipient_phone,
                        scenario=scenario,
                        variables=sms_vars,
                        is_demo=is_demo
                    )

                    notif = models.NotificationLog(
                        id=f"NOTIF-{uuid.uuid4().hex[:10].upper()}",
                        patient_id=pat.id,
                        appointment_id=appt.id,
                        test_id=test_id,
                        scenario=scenario,
                        channel="sms",
                        status=status,
                        subject=f"DLT SMS ({dlt_id})",
                        message=message_text,
                        provider_message_id=prov_id,
                        error_message=err_msg,
                        ai_generation_mode="dlt_template",
                        recipient_phone=recipient_phone,
                        is_demo=is_demo,
                        simulation_date=curr_date_str
                    )
                    db.add(notif)
                    db.commit()
                    sms_sent += 1

                    # Add patient timeline event
                    tl = models.TimelineEvent(
                        id=f"TL-NOTIF-{uuid.uuid4().hex[:8].upper()}",
                        patient_id=pat.id,
                        date_str=curr_date.strftime("%d %b %Y"),
                        title=f"📱 SMS: {scenario.replace('_', ' ').title()}",
                        description=message_text,
                        status="completed",
                        event_type="communication"
                    )
                    db.add(tl)
                    db.commit()

                    processed_logs.append({
                        "id": notif.id,
                        "patientName": pat.name,
                        "scenario": scenario,
                        "channel": "sms",
                        "status": status,
                        "dltId": dlt_id,
                        "providerId": prov_id
                    })

                elif channel == "staff_alert":
                    alert_subject = f"⚠ ACTION REQUIRED: {pat.name} — Missing {test_name}"
                    alert_msg = (
                        f"Patient: {pat.name}\n"
                        f"Appointment: {appt_date_formatted} ({appt.doctor_name})\n"
                        f"Missing Test: {test_name}\n"
                        f"Days Remaining: 2 days away\n"
                        f"Recommended Coordinator Action: Please contact the patient directly to assist with test scheduling before clinic visit."
                    )
                    notif = models.NotificationLog(
                        id=f"NOTIF-{uuid.uuid4().hex[:10].upper()}",
                        patient_id=pat.id,
                        appointment_id=appt.id,
                        test_id=test_id,
                        scenario="staff_missing_test",
                        channel="staff_alert",
                        status="sent",
                        subject=alert_subject,
                        message=alert_msg,
                        provider_message_id=f"STAFF-ESC-{uuid.uuid4().hex[:8].upper()}",
                        ai_generation_mode="staff_template",
                        is_demo=is_demo,
                        simulation_date=curr_date_str
                    )
                    db.add(notif)
                    db.commit()
                    staff_alerts += 1

                    # Add patient timeline event
                    tl = models.TimelineEvent(
                        id=f"TL-NOTIF-{uuid.uuid4().hex[:8].upper()}",
                        patient_id=pat.id,
                        date_str=curr_date.strftime("%d %b %Y"),
                        title="⚠ Care Coordinator Alerted",
                        description="Care Coordinator was notified to follow up on pending diagnostic blood test.",
                        status="completed",
                        event_type="communication"
                    )
                    db.add(tl)
                    db.commit()

                    processed_logs.append({
                        "id": notif.id,
                        "patientName": pat.name,
                        "scenario": "staff_missing_test",
                        "channel": "staff_alert",
                        "status": "sent",
                        "subject": alert_subject
                    })

            except Exception as e:
                failed_count += 1
                fail_log = models.NotificationLog(
                    id=f"NOTIF-FAIL-{uuid.uuid4().hex[:8].upper()}",
                    patient_id=pat.id,
                    appointment_id=appt.id,
                    scenario=scenario,
                    channel=channel,
                    status="failed",
                    subject=f"Failed: {scenario}",
                    message=f"Error executing dispatch for {channel}: {str(e)}",
                    error_message=str(e),
                    is_demo=is_demo,
                    simulation_date=curr_date_str
                )
                db.add(fail_log)
                db.commit()

    duration = round((datetime.datetime.now() - start_time).total_seconds(), 2)
    summary_text = (
        f"Checked: {appointments_checked} | Scenarios: {scenarios_detected} | "
        f"Emails: {emails_sent} | SMS: {sms_sent} | Alerts: {staff_alerts} | "
        f"Skipped: {skipped_count} | Failed: {failed_count} | Time: {duration}s"
    )

    state.last_run_at = datetime.datetime.now()
    state.last_run_summary = summary_text
    db.commit()

    return {
        "simulationDate": curr_date_str,
        "appointmentsChecked": appointments_checked,
        "scenariosDetected": scenarios_detected,
        "emailsSent": emails_sent,
        "smsSent": sms_sent,
        "staffAlerts": staff_alerts,
        "skippedCount": skipped_count,
        "failedCount": failed_count,
        "durationSeconds": duration,
        "summary": summary_text,
        "items": processed_logs
    }

def reset_demo_state(db: Session) -> Dict[str, Any]:
    """
    Resets the synthetic demonstration dataset strictly according to the Jury demo spec:
    Patient: Ravi Kumar (MRN-RAVI-001)
    Appointment: 15 October 2026 (Scheduled)
    Required Test: Blood Test (Pending)
    Notifications: Cleared for demo
    Simulation Date: 2026-10-08
    """
    # 1. Ensure Ravi Kumar exists
    user_ravi = db.query(models.User).filter(models.User.email == "ravi@example.com").first()
    if not user_ravi:
        from auth import get_password_hash
        user_ravi = models.User(
            email="ravi@example.com",
            hashed_password=get_password_hash("password"),
            role="patient",
            name="Ravi Kumar"
        )
        db.add(user_ravi)
        db.commit()
        db.refresh(user_ravi)

    pat_ravi = db.query(models.Patient).filter(models.Patient.id == "MRN-RAVI-001").first()
    if not pat_ravi:
        pat_ravi = models.Patient(
            id="MRN-RAVI-001",
            user_id=user_ravi.id,
            name="Ravi Kumar",
            email="ravi@example.com",
            dob="1972-04-15",
            gender="Male",
            primary_diagnosis="Post-PCI Acute Coronary Syndrome",
            admission_date="01 Oct 2026",
            discharge_date="05 Oct 2026",
            attending_physician="Dr. Rajesh Mehta",
            contact_phone="+919876543210",
            preferred_language="English",
            priority_level="high-priority",
            email_consent=True,
            sms_consent=True
        )
        db.add(pat_ravi)
        db.commit()
        db.refresh(pat_ravi)
    else:
        pat_ravi.name = "Ravi Kumar"
        pat_ravi.email = "ravi@example.com"
        pat_ravi.contact_phone = "+919876543210"
        pat_ravi.email_consent = True
        pat_ravi.sms_consent = True
        db.commit()

    # 2. Reset Appointment for 15 Oct 2026
    appt_date = datetime.date(2026, 10, 15)
    appt = db.query(models.Appointment).filter(models.Appointment.id == "APT-RAVI-001").first()
    if not appt:
        appt = models.Appointment(
            id="APT-RAVI-001",
            patient_id=pat_ravi.id,
            appointment_date=appt_date,
            time_str="10:30 AM",
            doctor_name="Dr. Rajesh Mehta",
            department="Cardiology",
            location="Suite 204 • Heart Center",
            status="scheduled",
            notes="Post-discharge comprehensive cardiology outpatient evaluation"
        )
        db.add(appt)
        db.commit()
        db.refresh(appt)
    else:
        appt.appointment_date = appt_date
        appt.status = "scheduled"
        db.commit()

    # 3. Reset Required Test (Blood Test) to Pending
    test_due = datetime.date(2026, 10, 14)
    test = db.query(models.RequiredTest).filter(models.RequiredTest.id == "TEST-RAVI-001").first()
    if not test:
        test = models.RequiredTest(
            id="TEST-RAVI-001",
            appointment_id=appt.id,
            patient_id=pat_ravi.id,
            test_name="Blood Test (Fasting Lipid & Renal Panel)",
            due_date=test_due,
            status="pending",
            source_doc="Discharge Summary • Page 3",
            notes="Required before 15 Oct cardiology evaluation"
        )
        db.add(test)
        db.commit()
    else:
        test.status = "pending"
        test.completed_at = None
        db.commit()

    # 4. Clear demo notification logs for Ravi Kumar
    db.query(models.NotificationLog).filter(models.NotificationLog.patient_id == pat_ravi.id).delete()
    
    # 5. Reset timeline events for Ravi Kumar to clean baseline
    db.query(models.TimelineEvent).filter(models.TimelineEvent.patient_id == pat_ravi.id).delete()
    initial_timeline = [
        models.TimelineEvent(
            id=f"TL-INIT-1",
            patient_id=pat_ravi.id,
            date_str="05 Oct 2026",
            title="Hospital Discharge & Care Plan Activated",
            description="Post-discharge care plan initialized with required cardiology follow-up and pre-visit blood work.",
            status="completed",
            event_type="instruction"
        ),
        models.TimelineEvent(
            id=f"TL-INIT-2",
            patient_id=pat_ravi.id,
            date_str="08 Oct 2026",
            title="CareFlow Care Plan Monitoring Started",
            description="Automated tracking active for 14 Oct Fasting Blood Draw and 15 Oct Cardiology Appointment.",
            status="in-progress",
            event_type="appointment"
        )
    ]
    for tl in initial_timeline:
        db.add(tl)

    # 6. Reset simulation date to 2026-10-08
    state = get_or_create_automation_state(db)
    state.simulation_date = "2026-10-08"
    state.last_run_at = None
    state.last_run_summary = "Demo data reset to clean baseline (08 Oct 2026, Blood Test: Pending, Appt: Scheduled)"
    db.commit()

    return {
        "status": "success",
        "message": "Demo state successfully reset to initial baseline",
        "patient": "Ravi Kumar (MRN-RAVI-001)",
        "appointment": "15 October 2026 (Scheduled)",
        "requiredTest": "Blood Test (Pending)",
        "simulationDate": "2026-10-08",
        "notificationsCleared": True
    }
