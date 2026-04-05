import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User, Interest, Notification

router = APIRouter(prefix="/interests", tags=["interests"])


class SendInterestDto(BaseModel):
    receiverId: int
    message: Optional[str] = None


class RespondDto(BaseModel):
    status: str  # ACCEPTED | REJECTED


def interest_to_dict(i: Interest) -> dict:
    d = {c.name: getattr(i, c.name) for c in Interest.__table__.columns}
    d["status"] = i.status.value
    return d


def add_notification(db: Session, user_id: int, title: str, message: str, type: str, data: dict = None):
    notif = Notification(userId=user_id, title=title, message=message, type=type,
                         data=json.dumps(data) if data else None)
    db.add(notif)


@router.post("")
def send_interest(dto: SendInterestDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Interest).filter(
        Interest.senderId == current_user.id,
        Interest.receiverId == dto.receiverId,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Interest already sent")

    interest = Interest(senderId=current_user.id, receiverId=dto.receiverId, message=dto.message)
    db.add(interest)
    db.flush()

    add_notification(db, dto.receiverId, "New Interest Received",
                     "Someone has shown interest in your profile", "interest",
                     {"interestId": interest.id, "senderId": current_user.id})
    db.commit()
    db.refresh(interest)
    return ok(interest_to_dict(interest), 201)


@router.patch("/{interest_id}/respond")
def respond_to_interest(interest_id: int, dto: RespondDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    interest = db.query(Interest).filter(Interest.id == interest_id).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")
    if interest.receiverId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    interest.status = dto.status
    db.flush()

    label = "Accepted" if dto.status == "ACCEPTED" else "Rejected"
    add_notification(db, interest.senderId, f"Interest {label}",
                     f"Your interest has been {dto.status.lower()}", "interest_response",
                     {"interestId": interest_id, "status": dto.status})
    db.commit()
    db.refresh(interest)
    return ok(interest_to_dict(interest))


@router.get("/sent")
def get_sent(page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Interest).filter(Interest.senderId == current_user.id)
    total = query.count()
    interests = query.order_by(Interest.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()
    result = []
    for i in interests:
        d = interest_to_dict(i)
        if i.receiver and i.receiver.profile:
            p = i.receiver.profile
            d["receiver"] = {"id": i.receiver.id, "profile": {"name": p.name, "age": p.age, "city": p.city, "photos": json.loads(p.photos) if p.photos else []}}
        result.append(d)
    return ok({"interests": result, "total": total, "page": page, "limit": limit})


@router.get("/received")
def get_received(page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Interest).filter(Interest.receiverId == current_user.id)
    total = query.count()
    interests = query.order_by(Interest.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()
    result = []
    for i in interests:
        d = interest_to_dict(i)
        if i.sender and i.sender.profile:
            p = i.sender.profile
            d["sender"] = {"id": i.sender.id, "profile": {"name": p.name, "age": p.age, "city": p.city, "photos": json.loads(p.photos) if p.photos else []}}
        result.append(d)
    return ok({"interests": result, "total": total, "page": page, "limit": limit})


@router.get("/matches")
def get_accepted_matches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    interests = db.query(Interest).filter(
        ((Interest.senderId == current_user.id) | (Interest.receiverId == current_user.id)),
        Interest.status == "ACCEPTED",
    ).all()
    result = []
    for i in interests:
        d = interest_to_dict(i)
        if i.sender and i.sender.profile:
            p = i.sender.profile
            d["sender"] = {"id": i.sender.id, "profile": {"name": p.name, "age": p.age, "city": p.city, "photos": json.loads(p.photos) if p.photos else []}}
        if i.receiver and i.receiver.profile:
            p = i.receiver.profile
            d["receiver"] = {"id": i.receiver.id, "profile": {"name": p.name, "age": p.age, "city": p.city, "photos": json.loads(p.photos) if p.photos else []}}
        result.append(d)
    return ok(result)
