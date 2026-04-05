from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User, Chat

router = APIRouter(prefix="/chat", tags=["chat"])


class SendMessageDto(BaseModel):
    receiverId: int
    message: str


def msg_to_dict(m: Chat) -> dict:
    return {c.name: getattr(m, c.name) for c in Chat.__table__.columns}


@router.post("/send")
def send_message(dto: SendMessageDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msg = Chat(senderId=current_user.id, receiverId=dto.receiverId, message=dto.message)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return ok(msg_to_dict(msg), 201)


@router.get("/conversation/{other_user_id}")
def get_conversation(other_user_id: int, page: int = 1, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Chat).filter(
        ((Chat.senderId == current_user.id) & (Chat.receiverId == other_user_id)) |
        ((Chat.senderId == other_user_id) & (Chat.receiverId == current_user.id))
    )
    total = query.count()
    messages = query.order_by(Chat.createdAt.asc()).offset((page - 1) * limit).limit(limit).all()

    # Mark received messages as read
    db.query(Chat).filter(Chat.senderId == other_user_id, Chat.receiverId == current_user.id, Chat.isRead == False).update({"isRead": True})
    db.commit()

    return ok({"messages": [msg_to_dict(m) for m in messages], "total": total})


@router.get("/threads")
def get_threads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import func, or_, and_, case
    # Get latest message per conversation partner
    uid = current_user.id
    messages = db.query(Chat).filter(
        (Chat.senderId == uid) | (Chat.receiverId == uid)
    ).order_by(Chat.createdAt.desc()).all()

    seen = set()
    threads = []
    for m in messages:
        partner_id = m.receiverId if m.senderId == uid else m.senderId
        if partner_id in seen:
            continue
        seen.add(partner_id)
        partner = db.query(User).filter(User.id == partner_id).first()
        unread = db.query(Chat).filter(Chat.senderId == partner_id, Chat.receiverId == uid, Chat.isRead == False).count()
        threads.append({
            "partnerId": partner_id,
            "partnerName": partner.profile.name if partner and partner.profile else partner.email if partner else "",
            "lastMessage": m.message,
            "lastMessageAt": m.createdAt,
            "unreadCount": unread,
        })
    return ok(threads)
