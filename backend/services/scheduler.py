"""
CareFlow AI — APScheduler Background Service
Runs daily automated care-plan monitoring pipeline at 09:00 AM IST (Asia/Kolkata).
Shares the exact same automation service pipeline as the on-demand demo runner.
"""

import logging
from zoneinfo import ZoneInfo
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from database import SessionLocal
from services.automation_service import run_automation_pipeline

logger = logging.getLogger("CareFlowScheduler")
KOLKATA_TZ = ZoneInfo("Asia/Kolkata")

scheduler = BackgroundScheduler(timezone=KOLKATA_TZ)

def scheduled_automation_job():
    """
    Daily production automated execution at 09:00 AM IST.
    """
    db = SessionLocal()
    try:
        logger.info("Executing scheduled CareFlow automation run at 09:00 AM IST...")
        result = run_automation_pipeline(db, is_demo=False, bypass_hours_check=False)
        logger.info(f"CareFlow scheduled run finished: {result.get('summary')}")
    except Exception as e:
        logger.error(f"Error in scheduled CareFlow automation run: {e}")
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        # Schedule daily at 09:00 AM Asia/Kolkata
        scheduler.add_job(
            scheduled_automation_job,
            trigger=CronTrigger(hour=9, minute=0, timezone=KOLKATA_TZ),
            id="careflow_daily_0900_ist",
            name="CareFlow Daily 09:00 AM IST Patient Reminder Pipeline",
            replace_existing=True
        )
        scheduler.start()
        logger.info("CareFlow APScheduler background runner started (Asia/Kolkata 09:00 AM)")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("CareFlow APScheduler background runner stopped")
