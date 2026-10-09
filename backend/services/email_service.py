"""
CareFlow AI — Email Delivery Service
Handles SMTP dispatch when configured; provides clean, realistic simulation logging when offline or in demo mode.
"""

import os
import smtplib
import uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple, Optional

def send_email(
    recipient: str,
    subject: str,
    body: str,
    is_demo: bool = True
) -> Tuple[str, str, Optional[str], str]:
    """
    Attempts SMTP delivery if credentials exist; otherwise executes in Simulation mode.
    Returns: (status: 'sent' | 'simulated' | 'failed', provider_message_id, error_message, delivery_mode)
    """
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_EMAIL")
    smtp_pass = os.getenv("SMTP_PASSWORD")

    # If real SMTP credentials are provided, attempt real dispatch
    if smtp_host and smtp_user and smtp_pass:
        try:
            port = int(smtp_port) if smtp_port else 587
            msg = MIMEMultipart()
            msg["From"] = f"CareFlow AI Coordinator <{smtp_user}>"
            msg["To"] = recipient
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain", "utf-8"))

            with smtplib.SMTP(smtp_host, port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)

            provider_id = f"SMTP-MSG-{uuid.uuid4().hex[:12].upper()}"
            return "sent", provider_id, None, "Real SMTP Dispatch"
        except Exception as e:
            # Fall back to simulation on SMTP failure so demo flow is not blocked
            provider_id = f"SIM-EMAIL-{uuid.uuid4().hex[:10].upper()}"
            return "simulated", provider_id, f"SMTP Error ({str(e)}). Executed in Simulation Mode.", "Simulation (SMTP Error Fallback)"

    # Default Demo Simulation Provider
    provider_id = f"SIM-EMAIL-{uuid.uuid4().hex[:10].upper()}"
    return "simulated", provider_id, None, "Simulation (SMTP not configured)"
