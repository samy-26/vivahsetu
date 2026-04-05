from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User, Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


def notif_to_dict(n: Notification) -> dict:
    return {c.name: getattr(n, c.name) for c in Notification.__table__.columns}


@router.get("")
def get_notifications(page: int = 1, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Notification).filter(Notification.userId == current_user.id)
    total = query.count()
    notifs = query.order_by(Notification.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()
    unread = db.query(Notification).filter(Notification.userId == current_user.id, Notification.isRead == False).count()
    return ok({"notifications": [notif_to_dict(n) for n in notifs], "total": total, "unread": unread})


@router.patch("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.userId == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.isRead = True
    db.commit()
    return ok(notif_to_dict(notif))


@router.patch("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.userId == current_user.id, Notification.isRead == False).update({"isRead": True})
    db.commit()
    return ok({"message": "All notifications marked as read"})
