import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)


def send_email_sync(to: str, subject: str, html: str):
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        logger.warning(f"SMTP not configured, skipping email to {to}")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"VivahSetu <{settings.SMTP_USER}>"
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.SMTP_USER, to, msg.as_string())
        logger.info(f"Email sent to {to}")
    except Exception as e:
        logger.warning(f"Email send failed to {to}: {e}")


def send_welcome_email(to: str, name: str):
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h1 style="color:#CC3322;">Welcome to VivahSetu!</h1>
      <p>Dear {name},</p>
      <p>Welcome to VivahSetu - your trusted Brahmana matrimonial platform.</p>
      <p>Complete your profile to start your matchmaking journey.</p>
      <a href="{settings.FRONTEND_URL}/dashboard"
         style="background:#CC3322;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">
        Complete Profile
      </a>
      <p>Best regards,<br/>Team VivahSetu</p>
    </div>
    """
    send_email_sync(to, "Welcome to VivahSetu!", html)


def send_otp_email(to: str, otp: str):
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#CC3322;">Your OTP for VivahSetu</h2>
      <p>Your one-time password is:</p>
      <div style="background:#f8f8f8;border:2px solid #CC3322;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#CC3322;">{otp}</span>
      </div>
      <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      <p>Team VivahSetu</p>
    </div>
    """
    send_email_sync(to, "Your VivahSetu OTP", html)


def send_payment_confirmation(to: str, amount: float, purpose: str):
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#27ae60;">Payment Successful!</h2>
      <p>Thank you for your payment of <strong>&#8377;{amount}</strong> for <strong>{purpose}</strong>.</p>
      <p>Your account has been updated. You can now enjoy premium features.</p>
      <p>Team VivahSetu</p>
    </div>
    """
    send_email_sync(to, "Payment Confirmation - VivahSetu", html)
