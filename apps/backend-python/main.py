import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import socketio
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, users, profiles, matchmaking, interests, subscriptions, payments, blog, gallery, notifications, admin, chat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Socket.IO ───────────────────────────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.FRONTEND_URL,
    logger=False,
    engineio_logger=False,
)

connected_users: dict[str, int] = {}  # sid -> userId


@sio.event
async def connect(sid, environ, auth_data):
    user_id = auth_data.get("userId") if auth_data else None
    if user_id:
        connected_users[sid] = user_id
        await sio.enter_room(sid, f"user_{user_id}")
    logger.info(f"Socket connected: {sid}")


@sio.event
async def disconnect(sid):
    connected_users.pop(sid, None)
    logger.info(f"Socket disconnected: {sid}")


@sio.event
async def send_message(sid, data):
    db = SessionLocal()
    try:
        from app.models import Chat as ChatModel
        sender_id = connected_users.get(sid)
        if not sender_id:
            return
        msg = ChatModel(senderId=sender_id, receiverId=data["receiverId"], message=data["message"])
        db.add(msg)
        db.commit()
        db.refresh(msg)
        payload = {"id": msg.id, "senderId": msg.senderId, "receiverId": msg.receiverId,
                   "message": msg.message, "isRead": msg.isRead, "createdAt": msg.createdAt.isoformat()}
        await sio.emit("new_message", payload, room=f"user_{data['receiverId']}")
        await sio.emit("new_message", payload, room=f"user_{sender_id}")
    finally:
        db.close()


@sio.event
async def typing(sid, data):
    sender_id = connected_users.get(sid)
    if sender_id:
        await sio.emit("user_typing", {"userId": sender_id}, room=f"user_{data.get('receiverId')}")


# ─── Scheduler ───────────────────────────────────────────────────────────────
def expire_subscriptions():
    db = SessionLocal()
    try:
        from app.models import Subscription
        result = db.query(Subscription).filter(
            Subscription.status == "ACTIVE", Subscription.endDate < datetime.utcnow()
        ).update({"status": "EXPIRED"})
        db.commit()
        if result:
            logger.info(f"Expired {result} subscriptions")
    except Exception as e:
        logger.error(f"Subscription expiry error: {e}")
    finally:
        db.close()


# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="VivahSetu API",
    description="Brahmana Matrimonial Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "statusCode": exc.status_code,
                "message": exc.detail,
                "path": str(request.url.path),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
    logger.exception(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "statusCode": 500,
            "message": "Internal server error",
            "path": str(request.url.path),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    scheduler = BackgroundScheduler()
    scheduler.add_job(expire_subscriptions, "cron", hour=0, minute=0)
    scheduler.start()
    logger.info("VivahSetu Python backend started")


@app.get("/api/health")
def health():
    return {"status": "ok"}


PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
app.include_router(profiles.router, prefix=PREFIX)
app.include_router(matchmaking.router, prefix=PREFIX)
app.include_router(interests.router, prefix=PREFIX)
app.include_router(subscriptions.router, prefix=PREFIX)
app.include_router(payments.router, prefix=PREFIX)
app.include_router(blog.router, prefix=PREFIX)
app.include_router(gallery.router, prefix=PREFIX)
app.include_router(notifications.router, prefix=PREFIX)
app.include_router(admin.router, prefix=PREFIX)
app.include_router(chat.router, prefix=PREFIX)

# Mount Socket.IO at /socket.io
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
