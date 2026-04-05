import re
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin, ok
from app.models import User, Blog

router = APIRouter(prefix="/blog", tags=["blog"])


class BlogDto(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    imageUrl: Optional[str] = None
    isPublished: Optional[bool] = False
    tags: Optional[str] = None
    metaTitle: Optional[str] = None
    metaDesc: Optional[str] = None


def blog_to_dict(b: Blog) -> dict:
    return {c.name: getattr(b, c.name) for c in Blog.__table__.columns}


def slugify(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


@router.get("")
def list_blogs(page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    query = db.query(Blog).filter(Blog.isPublished == True)
    total = query.count()
    blogs = query.order_by(Blog.createdAt.desc()).offset((page - 1) * limit).limit(limit).all()
    return ok({"blogs": [blog_to_dict(b) for b in blogs], "total": total, "page": page, "limit": limit})


@router.get("/{slug}")
def get_blog(slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    blog.viewCount = (blog.viewCount or 0) + 1
    db.commit()
    return ok(blog_to_dict(blog))


@router.post("")
def create_blog(dto: BlogDto, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    slug = slugify(dto.title)
    existing = db.query(Blog).filter(Blog.slug == slug).first()
    if existing:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    blog = Blog(slug=slug, authorId=admin.id, **dto.model_dump())
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return ok(blog_to_dict(blog), 201)


@router.put("/{blog_id}")
def update_blog(blog_id: int, dto: BlogDto, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    for k, v in dto.model_dump(exclude_none=True).items():
        setattr(blog, k, v)
    blog.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(blog)
    return ok(blog_to_dict(blog))


@router.delete("/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()
    return ok({"message": "Blog deleted"})
