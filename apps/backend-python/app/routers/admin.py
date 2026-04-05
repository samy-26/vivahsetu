from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.deps import require_admin, ok
from app.models import User, Profile, Payment, Subscription

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(User).count()
    total_profiles = db.query(Profile).count()
    pending_approvals = db.query(Profile).filter(Profile.isApprovedByAdmin == False).count()
    total_payments = db.query(Payment).filter(Payment.status == "SUCCESS").count()
    active_subscriptions = db.query(Subscription).filter(
        Subscription.status == "ACTIVE", Subscription.endDate > datetime.utcnow()
    ).count()
    return ok({
        "totalUsers": total_users,
        "totalProfiles": total_profiles,
        "pendingApprovals": pending_approvals,
        "totalPayments": total_payments,
        "activeSubscriptions": active_subscriptions,
    })


@router.get("/users")
def list_users(page: int = 1, limit: int = 20, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(User)
    total = query.count()
    users = query.order_by(User.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()
    result = []
    for u in users:
        d = {c.name: getattr(u, c.name) for c in User.__table__.columns}
        d.pop("password", None)
        d.pop("otpSecret", None)
        d["role"] = u.role.value
        result.append(d)
    return ok({"users": result, "total": total, "page": page, "limit": limit})


@router.get("/pending-profiles")
def pending_profiles(page: int = 1, limit: int = 20, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(Profile).filter(Profile.isApprovedByAdmin == False)
    total = query.count()
    profiles = query.order_by(Profile.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()
    import json
    result = []
    for p in profiles:
        d = {c.name: getattr(p, c.name) for c in Profile.__table__.columns}
        d["photos"] = json.loads(p.photos) if p.photos else []
        result.append(d)
    return ok({"profiles": result, "total": total, "page": page, "limit": limit})


@router.patch("/profiles/{profile_id}/approve")
def approve_profile(profile_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.isApprovedByAdmin = True
    profile.approvedAt = datetime.utcnow()
    profile.approvedBy = admin.id
    db.commit()
    return ok({"message": "Profile approved"})


@router.patch("/profiles/{profile_id}/reject")
def reject_profile(profile_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.isApprovedByAdmin = False
    profile.isActive = False
    db.commit()
    return ok({"message": "Profile rejected"})


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return ok({"message": "User deleted"})
