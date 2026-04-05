import hashlib
import hmac
import json
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.config import settings
from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User, Payment
from app.routers.subscriptions import create_subscription
from app.services.email import send_payment_confirmation

router = APIRouter(prefix="/payments", tags=["payments"])


class CreateOrderDto(BaseModel):
    amount: float
    purpose: str
    metadata: Optional[dict] = None


class VerifyDto(BaseModel):
    razorpayOrderId: str
    razorpayPaymentId: str
    razorpaySignature: str


@router.post("/create-order")
def create_order(dto: CreateOrderDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not settings.RAZORPAY_KEY_ID:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    import razorpay
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    amount_paisa = int(dto.amount * 100)

    rp_order = client.order.create({
        "amount": amount_paisa,
        "currency": "INR",
        "receipt": f"vivahsetu_{current_user.id}_{int(__import__('time').time())}",
        "notes": {"userId": str(current_user.id), "purpose": dto.purpose},
    })

    payment = Payment(
        userId=current_user.id, amount=dto.amount,
        razorpayOrderId=rp_order["id"], status="PENDING",
        purpose=dto.purpose,
        meta=json.dumps(dto.metadata) if dto.metadata else None,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return ok({
        "orderId": rp_order["id"],
        "amount": amount_paisa,
        "currency": "INR",
        "keyId": settings.RAZORPAY_KEY_ID,
        "paymentId": payment.id,
    })


@router.post("/verify")
def verify_payment(dto: VerifyDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    body = f"{dto.razorpayOrderId}|{dto.razorpayPaymentId}"
    expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
    if expected != dto.razorpaySignature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    payment = db.query(Payment).filter(Payment.razorpayOrderId == dto.razorpayOrderId, Payment.userId == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.razorpayPaymentId = dto.razorpayPaymentId
    payment.razorpaySignature = dto.razorpaySignature
    payment.status = "SUCCESS"
    db.commit()

    if payment.purpose == "subscription":
        meta = json.loads(payment.meta) if payment.meta else {}
        create_subscription(db, current_user.id, meta.get("planType", "BASIC"), payment.id)

    user = db.query(User).filter(User.id == current_user.id).first()
    try:
        send_payment_confirmation(user.email, payment.amount, payment.purpose or "")
    except Exception:
        pass

    return ok({"success": True, "paymentId": payment.id})


@router.post("/webhook")
def webhook(body: dict, x_razorpay_signature: Optional[str] = Header(None)):
    if settings.RAZORPAY_WEBHOOK_SECRET and x_razorpay_signature:
        expected = hmac.new(settings.RAZORPAY_WEBHOOK_SECRET.encode(),
                            json.dumps(body).encode(), hashlib.sha256).hexdigest()
        if expected != x_razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    return ok({"received": True})


@router.get("/history")
def payment_history(page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Payment).filter(Payment.userId == current_user.id)
    total = query.count()
    payments = query.order_by(Payment.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()
    result = [{c.name: getattr(p, c.name) for c in Payment.__table__.columns} for p in payments]
    for r in result:
        r["status"] = r["status"].value if hasattr(r["status"], "value") else r["status"]
    return ok({"payments": result, "total": total, "page": page, "limit": limit})
