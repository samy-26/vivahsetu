import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, ok
from app.models import User, Profile, FamilyDetails, KundliDetails, Subscription, ContactView

router = APIRouter(prefix="/profiles", tags=["profiles"])


class ProfileDto(BaseModel):
    name: str
    age: int
    height: Optional[str] = None
    weight: Optional[str] = None
    complexion: Optional[str] = None
    maritalStatus: Optional[str] = "Single"
    education: Optional[str] = None
    profession: Optional[str] = None
    income: Optional[str] = None
    gotra: Optional[str] = None
    manglik: Optional[bool] = False
    bio: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    nativePlace: Optional[str] = None


class SearchDto(BaseModel):
    minAge: Optional[int] = None
    maxAge: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    gotra: Optional[str] = None
    maritalStatus: Optional[str] = None
    education: Optional[str] = None
    profession: Optional[str] = None
    page: Optional[int] = 1
    limit: Optional[int] = 10


class FamilyDto(BaseModel):
    fatherName: Optional[str] = None
    fatherOccupation: Optional[str] = None
    motherName: Optional[str] = None
    motherOccupation: Optional[str] = None
    siblings: Optional[str] = None
    familyType: Optional[str] = None
    familyBackground: Optional[str] = None
    familyIncome: Optional[str] = None


def profile_to_dict(p: Profile) -> dict:
    return {
        "id": p.id, "userId": p.userId, "name": p.name, "age": p.age,
        "height": p.height, "weight": p.weight, "complexion": p.complexion,
        "maritalStatus": p.maritalStatus, "education": p.education,
        "profession": p.profession, "income": p.income, "gotra": p.gotra,
        "manglik": p.manglik, "bio": p.bio, "city": p.city, "state": p.state,
        "country": p.country, "nativePlace": p.nativePlace,
        "photos": json.loads(p.photos) if p.photos else [],
        "isApprovedByAdmin": p.isApprovedByAdmin, "isActive": p.isActive,
        "profileViews": p.profileViews, "createdAt": p.createdAt, "updatedAt": p.updatedAt,
    }


@router.post("")
def create_or_update_profile(dto: ProfileDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.userId == current_user.id).first()
    if profile:
        for k, v in dto.model_dump(exclude_none=True).items():
            setattr(profile, k, v)
        profile.updatedAt = datetime.utcnow()
    else:
        profile = Profile(userId=current_user.id, **dto.model_dump())
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return ok(profile_to_dict(profile))


@router.get("/me")
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.userId == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    d = profile_to_dict(profile)
    d["user"] = {
        "id": current_user.id, "role": current_user.role.value,
        "isVerified": current_user.isVerified, "email": current_user.email, "phone": current_user.phone,
        "familyDetails": None, "kundliDetails": None,
    }
    if current_user.familyDetails:
        fd = current_user.familyDetails
        d["user"]["familyDetails"] = {c.name: getattr(fd, c.name) for c in FamilyDetails.__table__.columns}
    if current_user.kundliDetails:
        kd = current_user.kundliDetails
        d["user"]["kundliDetails"] = {c.name: getattr(kd, c.name) for c in KundliDetails.__table__.columns}
    return ok(d)


@router.get("/search")
def search_profiles(
    minAge: Optional[int] = None, maxAge: Optional[int] = None,
    city: Optional[str] = None, state: Optional[str] = None,
    country: Optional[str] = None, gotra: Optional[str] = None,
    maritalStatus: Optional[str] = None, education: Optional[str] = None,
    profession: Optional[str] = None, page: int = 1, limit: int = 10,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    opposite_role = "GROOM" if current_user.role.value == "BRIDE" else "BRIDE"
    query = db.query(Profile).join(User, Profile.userId == User.id).filter(
        Profile.isApprovedByAdmin == True,
        Profile.isActive == True,
        User.role == opposite_role,
    )
    if minAge: query = query.filter(Profile.age >= minAge)
    if maxAge: query = query.filter(Profile.age <= maxAge)
    if city: query = query.filter(Profile.city.ilike(f"%{city}%"))
    if state: query = query.filter(Profile.state.ilike(f"%{state}%"))
    if country: query = query.filter(Profile.country == country)
    if gotra: query = query.filter(Profile.gotra.ilike(f"%{gotra}%"))
    if maritalStatus: query = query.filter(Profile.maritalStatus == maritalStatus)
    if education: query = query.filter(Profile.education.ilike(f"%{education}%"))
    if profession: query = query.filter(Profile.profession.ilike(f"%{profession}%"))

    total = query.count()
    profiles = query.order_by(Profile.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()
    return ok({
        "profiles": [profile_to_dict(p) for p in profiles],
        "total": total, "page": page, "limit": limit,
        "totalPages": -(-total // limit),
    })


@router.get("/{profile_id}")
def get_profile(profile_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile or not profile.isApprovedByAdmin:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.profileViews = (profile.profileViews or 0) + 1
    db.commit()

    subscription = db.query(Subscription).filter(
        Subscription.userId == current_user.id,
        Subscription.status == "ACTIVE",
        Subscription.endDate > datetime.utcnow(),
        Subscription.remainingViews > 0,
    ).first()

    existing_view = db.query(ContactView).filter(
        ContactView.viewerId == current_user.id,
        ContactView.profileId == profile_id,
    ).first()

    d = profile_to_dict(profile)
    d["contactHidden"] = existing_view is None
    d["hasSubscription"] = subscription is not None
    d["remainingViews"] = subscription.remainingViews if subscription else 0
    d["revealedContact"] = {"email": existing_view.email, "phone": existing_view.phone} if existing_view else None
    return ok(d)


@router.post("/{profile_id}/view-contact")
def view_contact(profile_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).join(User, Profile.userId == User.id).filter(
        Profile.id == profile_id, Profile.isApprovedByAdmin == True
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    existing = db.query(ContactView).filter(
        ContactView.viewerId == current_user.id,
        ContactView.profileId == profile_id,
    ).first()
    if existing:
        return ok({"contactRevealed": True, "email": existing.email, "phone": existing.phone, "alreadyViewed": True, "remainingViews": None})

    subscription = db.query(Subscription).filter(
        Subscription.userId == current_user.id,
        Subscription.status == "ACTIVE",
        Subscription.endDate > datetime.utcnow(),
        Subscription.remainingViews > 0,
    ).first()
    if not subscription:
        return ok({"contactRevealed": False, "reason": "no_subscription"})

    subscription.remainingViews -= 1
    view = ContactView(viewerId=current_user.id, profileId=profile_id, email=profile.user.email, phone=profile.user.phone or "")
    db.add(view)
    db.commit()
    db.refresh(subscription)

    return ok({"contactRevealed": True, "email": profile.user.email, "phone": profile.user.phone, "alreadyViewed": False, "remainingViews": subscription.remainingViews})


@router.get("/me/contact-history")
def contact_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    views = db.query(ContactView).filter(ContactView.viewerId == current_user.id).order_by(ContactView.createdAt.desc()).all()
    result = []
    for v in views:
        p = v.profile
        result.append({
            "id": v.id, "createdAt": v.createdAt,
            "profile": {"id": p.id, "name": p.name, "age": p.age, "city": p.city, "state": p.state, "profession": p.profession, "photos": json.loads(p.photos) if p.photos else []},
        })
    return ok(result)


@router.put("/me")
def update_profile(dto: ProfileDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.userId == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for k, v in dto.model_dump(exclude_none=True).items():
        setattr(profile, k, v)
    profile.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return ok(profile_to_dict(profile))


@router.get("/me/family")
def get_family(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fd = db.query(FamilyDetails).filter(FamilyDetails.userId == current_user.id).first()
    return ok({c.name: getattr(fd, c.name) for c in FamilyDetails.__table__.columns} if fd else None)


@router.post("/me/family")
def upsert_family(dto: FamilyDto, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fd = db.query(FamilyDetails).filter(FamilyDetails.userId == current_user.id).first()
    if fd:
        for k, v in dto.model_dump(exclude_none=True).items():
            setattr(fd, k, v)
        fd.updatedAt = datetime.utcnow()
    else:
        fd = FamilyDetails(userId=current_user.id, **dto.model_dump())
        db.add(fd)
    db.commit()
    db.refresh(fd)
    return ok({c.name: getattr(fd, c.name) for c in FamilyDetails.__table__.columns})
