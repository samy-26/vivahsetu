import random
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User, OtpLog, UserRole
from app.services.email import send_welcome_email, send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def make_tokens(user: User):
    now = datetime.now(timezone.utc)
    access_payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.value,
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    refresh_payload = {
        "sub": user.id,
        "iat": now,
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return {
        "accessToken": jwt.encode(access_payload, settings.SECRET_KEY, algorithm="HS256"),
        "refreshToken": jwt.encode(refresh_payload, settings.REFRESH_SECRET_KEY, algorithm="HS256"),
    }


def sanitize(user: User) -> dict:
    d = {c.name: getattr(user, c.name) for c in User.__table__.columns}
    d.pop("password", None)
    d.pop("otpSecret", None)
    return d


class RegisterDto(BaseModel):
    email: EmailStr
    phone: str
    password: str
    role: str = "BRIDE"


class LoginDto(BaseModel):
    identifier: str
    password: str


class SendOtpDto(BaseModel):
    target: str
    type: str  # 'email' | 'phone'


class VerifyOtpDto(BaseModel):
    target: str
    otp: str


@router.post("/register", status_code=201)
def register(dto: RegisterDto, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.email == dto.email) | (User.phone == dto.phone)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email or phone already registered")

    role = UserRole(dto.role) if dto.role in UserRole._value2member_map_ else UserRole.BRIDE
    hashed = pwd_ctx.hash(dto.password)
    user = User(email=dto.email, phone=dto.phone, password=hashed, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        send_welcome_email(user.email, user.email.split("@")[0])
    except Exception:
        pass

    tokens = make_tokens(user)
    return ok({"user": sanitize(user), **tokens}, 201)


@router.post("/login")
def login(dto: LoginDto, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == dto.identifier) | (User.phone == dto.identifier)
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.password:
        raise HTTPException(status_code=401, detail="Please use OTP login")
    if not pwd_ctx.verify(dto.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.lastLogin = datetime.utcnow()
    db.commit()
    db.refresh(user)

    tokens = make_tokens(user)
    return ok({"user": sanitize(user), **tokens})


@router.post("/otp/send")
def send_otp(dto: SendOtpDto, db: Session = Depends(get_db)):
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.add(OtpLog(target=dto.target, type=dto.type, otp=otp, expiresAt=expires_at))
    db.commit()

    if dto.type == "email":
        try:
            send_otp_email(dto.target, otp)
        except Exception:
            pass

    return ok({"message": "OTP sent successfully", "expiresIn": 600})


@router.post("/otp/verify")
def verify_otp(dto: VerifyOtpDto, db: Session = Depends(get_db)):
    otp_log = db.query(OtpLog).filter(
        OtpLog.target == dto.target,
        OtpLog.otp == dto.otp,
        OtpLog.isUsed == False,
        OtpLog.expiresAt > datetime.utcnow(),
    ).order_by(OtpLog.createdAt.desc()).first()

    if not otp_log:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp_log.isUsed = True
    db.commit()

    user = db.query(User).filter(
        (User.email == dto.target) | (User.phone == dto.target)
    ).first()

    if not user:
        is_email = "@" in dto.target
        user = User(
            email=dto.target if is_email else f"{dto.target}@vivahsetu.com",
            phone="" if is_email else dto.target,
            isVerified=True,
            role=UserRole.BRIDE,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.isVerified = True
        user.lastLogin = datetime.utcnow()
        db.commit()
        db.refresh(user)

    tokens = make_tokens(user)
    return ok({"user": sanitize(user), **tokens})


@router.post("/refresh")
def refresh_token(body: dict, db: Session = Depends(get_db)):
    refresh_token = body.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="refreshToken required")
    try:
        payload = jwt.decode(refresh_token, settings.REFRESH_SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    tokens = make_tokens(user)
    return ok({"user": sanitize(user), **tokens})


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return ok(sanitize(current_user))
