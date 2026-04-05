from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])


class UpdateUserDto(BaseModel):
    phone: Optional[str] = None
    aadhaarNumber: Optional[str] = None


@router.get("")
def list_users(page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(User)
    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()
    result = []
    for u in users:
        d = {c.name: getattr(u, c.name) for c in User.__table__.columns}
        d.pop("password", None)
        d.pop("otpSecret", None)
        d["role"] = u.role.value
        result.append(d)
    return ok({"users": result, "total": total})


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    d = {c.name: getattr(user, c.name) for c in User.__table__.columns}
    d.pop("password", None)
    d.pop("otpSecret", None)
    d["role"] = user.role.value
    return ok(d)


@router.patch("/me")
def update_me(dto: UpdateUserDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for k, v in dto.model_dump(exclude_none=True).items():
        setattr(current_user, k, v)
    db.commit()
    db.refresh(current_user)
    d = {c.name: getattr(current_user, c.name) for c in User.__table__.columns}
    d.pop("password", None)
    d.pop("otpSecret", None)
    d["role"] = current_user.role.value
    return ok(d)
