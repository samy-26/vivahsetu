from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User, Subscription

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

PLANS = [
    {"id": "BASIC", "name": "Basic Plan", "price": 500, "duration": "1 Month", "durationDays": 30, "views": 10,
     "features": ["10 profile views/month", "Send interests", "Basic chat", "Email support"]},
    {"id": "STANDARD", "name": "Standard Plan", "price": 1500, "duration": "6 Months", "durationDays": 180, "views": 50,
     "features": ["50 contact views", "6 months validity", "Priority listing", "Chat access", "Phone support"]},
    {"id": "PLATINUM", "name": "Platinum Plan", "price": 2000, "duration": "Lifetime", "durationDays": 36500, "views": 60,
     "features": ["60 contact views", "Lifetime validity", "Top priority listing", "Unlimited chat", "Dedicated support", "Kundli discounts"]},
]

PLAN_CONFIG = {"BASIC": {"views": 10, "days": 30}, "STANDARD": {"views": 50, "days": 180}, "PLATINUM": {"views": 60, "days": 36500}}


def sub_to_dict(s: Subscription) -> dict:
    return {
        "id": s.id, "userId": s.userId, "planType": s.planType.value,
        "startDate": s.startDate, "endDate": s.endDate,
        "remainingViews": s.remainingViews, "status": s.status.value,
        "paymentId": s.paymentId, "createdAt": s.createdAt,
    }


def create_subscription(db: Session, user_id: int, plan_type: str, payment_id: int = None) -> Subscription:
    plan = PLAN_CONFIG[plan_type]
    db.query(Subscription).filter(Subscription.userId == user_id, Subscription.status == "ACTIVE").update({"status": "CANCELLED"})
    end_date = datetime.utcnow() + timedelta(days=plan["days"])
    sub = Subscription(userId=user_id, planType=plan_type, endDate=end_date,
                       remainingViews=plan["views"], status="ACTIVE", paymentId=payment_id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/plans")
def get_plans():
    return ok(PLANS)


@router.get("/my")
def get_my_subscription(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sub = db.query(Subscription).filter(
        Subscription.userId == current_user.id,
        Subscription.status == "ACTIVE",
        Subscription.endDate > datetime.utcnow(),
    ).order_by(Subscription.createdAt.desc()).first()
    return ok(sub_to_dict(sub) if sub else None)


@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subs = db.query(Subscription).filter(Subscription.userId == current_user.id).order_by(Subscription.createdAt.desc()).all()
    return ok([sub_to_dict(s) for s in subs])
