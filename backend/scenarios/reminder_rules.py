"""
CareFlow AI — Deterministic Patient Reminder Rule Engine
Determines precise communication scenario based on care dependencies, days left, and required test status.
Strict rule: AI is NOT used to decide business scenarios; rules are 100% deterministic.
"""

from datetime import date
from typing import List, Tuple, Optional, Any

SCENARIO_CONFIG = {
    "test_missing_early": {
        "title": "Early Required Test Reminder",
        "description": "7 days prior to clinic appointment: Patient informed that required diagnostic test is pending.",
        "channels": ["email"],
        "tone": "informative",
        "priority": "routine",
    },
    "test_missing_urgent": {
        "title": "Urgent Test Missing Notice",
        "description": "3 days prior: Fasting/lab draw needed urgently so results are ready for physician evaluation.",
        "channels": ["email", "sms"],
        "tone": "urgent",
        "priority": "high",
    },
    "staff_missing_test": {
        "title": "Staff Action Alert — Uncompleted Care Dependency",
        "description": "2 days prior: Operational escalation to Care Coordinator for outreach.",
        "channels": ["staff_alert"],
        "tone": "operational",
        "priority": "immediate-review",
    },
    "test_missing_final": {
        "title": "Final Test Missing Reminder",
        "description": "1 day prior: Last notice to get blood draw/imaging completed before tomorrow's visit.",
        "channels": ["email", "sms"],
        "tone": "urgent",
        "priority": "immediate-review",
    },
    "appointment_reminder": {
        "title": "Standard Appointment Reminder",
        "description": "1 day prior with all tests completed: Clinic timing, room location, and check-in guidance.",
        "channels": ["sms"],
        "tone": "reassuring",
        "priority": "routine",
    },
    "appointment_morning": {
        "title": "Morning of Appointment Check-in",
        "description": "Day of appointment (T-0) with tests completed: Same-day clinic arrival confirmation.",
        "channels": ["sms"],
        "tone": "operational",
        "priority": "routine",
    },
    "skipped_test_today": {
        "title": "Appointment Day Alert — Missing Test at Check-in",
        "description": "Day of appointment (T-0) with test still missing: Advise patient to notify reception immediately.",
        "channels": ["email", "sms"],
        "tone": "urgent",
        "priority": "high",
    },
    "missed_appointment": {
        "title": "Missed Appointment Rescheduling Assistance",
        "description": "Post-appointment date if marked no-show: Friendly outreach to reschedule essential post-discharge follow-up.",
        "channels": ["email", "sms"],
        "tone": "supportive",
        "priority": "high",
    },
}

def determine_scenario(
    appointment: Any,
    missing_tests: List[Any],
    current_date: date
) -> Tuple[Optional[str], List[str]]:
    """
    Calculate days until appointment and evaluate care dependency state.
    Returns: (scenario_name, target_channels)
    """
    appt_date = appointment.appointment_date
    if isinstance(appt_date, str):
        # Fallback if stored as string YYYY-MM-DD
        from datetime import datetime
        appt_date = datetime.strptime(appt_date, "%Y-%m-%d").date()

    days_left = (appt_date - current_date).days
    has_missing_test = len(missing_tests) > 0

    # Rule 1: T-7 + missing test
    if days_left == 7 and has_missing_test:
        return "test_missing_early", ["email"]

    # Rule 2: T-3 + missing test
    elif days_left == 3 and has_missing_test:
        return "test_missing_urgent", ["email", "sms"]

    # Rule 3: T-2 + missing test (Staff Alert only)
    elif days_left == 2 and has_missing_test:
        return "staff_missing_test", ["staff_alert"]

    # Rule 4: T-1 + missing test
    elif days_left == 1 and has_missing_test:
        return "test_missing_final", ["email", "sms"]

    # Rule 5: T-1 WITHOUT missing test (all tests completed)
    elif days_left == 1 and not has_missing_test:
        return "appointment_reminder", ["sms"]

    # Rule 6: T-0 WITHOUT missing test
    elif days_left == 0 and not has_missing_test:
        return "appointment_morning", ["sms"]

    # Rule 7: T-0 WITH missing test
    elif days_left == 0 and has_missing_test:
        return "skipped_test_today", ["email", "sms"]

    # Rule 8: Missed appointment check (T < 0)
    elif days_left < 0:
        status_norm = (getattr(appointment, "status", "") or "").lower()
        if status_norm in ("no_show", "missed", "no-show"):
            return "missed_appointment", ["email", "sms"]
        return None, []

    return None, []
