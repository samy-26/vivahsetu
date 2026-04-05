from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.deps import require_admin, ok
from app.models import Gallery

router = APIRouter(prefix="/gallery", tags=["gallery"])


class GalleryDto(BaseModel):
    imageUrl: str
    imageKey: str
    category: Optional[str] = None
    caption: Optional[str] = None
    isActive: Optional[bool] = True
    sortOrder: Optional[int] = 0


def gallery_to_dict(g: Gallery) -> dict:
    return {c.name: getattr(g, c.name) for c in Gallery.__table__.columns}


@router.get("")
def list_gallery(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Gallery).filter(Gallery.isActive == True)
    if category:
        query = query.filter(Gallery.category == category)
    items = query.order_by(Gallery.sortOrder.asc(), Gallery.createdAt.desc()).all()
    return ok([gallery_to_dict(g) for g in items])


@router.post("")
def add_gallery(dto: GalleryDto, db: Session = Depends(get_db), admin=Depends(require_admin)):
    item = Gallery(**dto.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return ok(gallery_to_dict(item), 201)


@router.delete("/{item_id}")
def delete_gallery(item_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    item = db.query(Gallery).filter(Gallery.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    db.delete(item)
    db.commit()
    return ok({"message": "Deleted"})
