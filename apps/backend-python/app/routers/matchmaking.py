import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User, Profile, Interest, Subscription

router = APIRouter(prefix="/matchmaking", tags=["matchmaking"])


def profile_to_dict(p):
    return {
        "id": p.id, "userId": p.userId, "name": p.name, "age": p.age,
        "height": p.height, "complexion": p.complexion, "maritalStatus": p.maritalStatus,
        "education": p.education, "profession": p.profession, "gotra": p.gotra,
        "manglik": p.manglik, "bio": p.bio, "city": p.city, "state": p.state,
        "country": p.country, "photos": json.loads(p.photos) if p.photos else [],
        "isApprovedByAdmin": p.isApprovedByAdmin, "profileViews": p.profileViews,
        "createdAt": p.createdAt,
        "user": {"id": p.user.id, "role": p.user.role.value, "isVerified": p.user.isVerified},
    }


@router.get("/recommendations")
def get_recommendations(page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    opposite_role = "GROOM" if current_user.role.value == "BRIDE" else "BRIDE"

    interactions = db.query(Interest).filter(
        (Interest.senderId == current_user.id) | (Interest.receiverId == current_user.id)
    ).all()
    exclude_ids = {current_user.id}
    for i in interactions:
        exclude_ids.add(i.senderId)
        exclude_ids.add(i.receiverId)

    query = db.query(Profile).join(User, Profile.userId == User.id).filter(
        Profile.isApprovedByAdmin == True,
        Profile.isActive == True,
        User.role == opposite_role,
        User.id.notin_(exclude_ids),
    )

    if current_user.profile:
        age = current_user.profile.age
        if current_user.role.value == "BRIDE":
            query = query.filter(Profile.age >= age - 5, Profile.age <= age + 10)
        else:
            query = query.filter(Profile.age >= age - 10, Profile.age <= age + 5)

    total = query.count()
    profiles = query.order_by(Profile.profileViews.desc(), Profile.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()

    return ok({
        "profiles": [profile_to_dict(p) for p in profiles],
        "total": total, "page": page, "limit": limit,
        "totalPages": -(-total // limit),
    })


@router.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import func
    sent = db.query(Interest).filter(Interest.senderId == current_user.id).count()
    received = db.query(Interest).filter(Interest.receiverId == current_user.id).count()
    accepted = db.query(Interest).filter(
        ((Interest.senderId == current_user.id) | (Interest.receiverId == current_user.id)),
        Interest.status == "ACCEPTED",
    ).count()

    subscription = db.query(Subscription).filter(
        Subscription.userId == current_user.id,
        Subscription.status == "ACTIVE",
        Subscription.endDate > datetime.utcnow(),
    ).first()

    return ok({
        "sentInterests": sent,
        "receivedInterests": received,
        "acceptedMatches": accepted,
        "subscription": {
            "planType": subscription.planType.value,
            "endDate": subscription.endDate,
            "remainingViews": subscription.remainingViews,
            "status": subscription.status.value,
        } if subscription else None,
    })
