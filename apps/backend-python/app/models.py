import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Float, Text,
    ForeignKey, Enum, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, enum.Enum):
    BRIDE = "BRIDE"
    GROOM = "GROOM"
    ADMIN = "ADMIN"


class InterestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class PlanType(str, enum.Enum):
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    PLATINUM = "PLATINUM"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PdfType(str, enum.Enum):
    KUNDLI = "KUNDLI"
    MATCHMAKING = "MATCHMAKING"
    INVOICE = "INVOICE"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=True)
    role = Column(Enum(UserRole, name="userrole"), default=UserRole.BRIDE)
    isVerified = Column(Boolean, default=False)
    isApproved = Column(Boolean, default=False)
    aadhaarNumber = Column(String, nullable=True)
    aadhaarUrl = Column(String, nullable=True)
    otpSecret = Column(String, nullable=True)
    otpExpiry = Column(DateTime, nullable=True)
    lastLogin = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    familyDetails = relationship("FamilyDetails", back_populates="user", uselist=False)
    kundliDetails = relationship("KundliDetails", back_populates="user", uselist=False)
    sentInterests = relationship("Interest", foreign_keys="Interest.senderId", back_populates="sender")
    receivedInterests = relationship("Interest", foreign_keys="Interest.receiverId", back_populates="receiver")
    sentMessages = relationship("Chat", foreign_keys="Chat.senderId", back_populates="sender")
    receivedMessages = relationship("Chat", foreign_keys="Chat.receiverId", back_populates="receiver")
    subscriptions = relationship("Subscription", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    pdfFiles = relationship("PdfFile", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    emailLogs = relationship("EmailLog", back_populates="user")
    contactViewsGiven = relationship("ContactView", foreign_keys="ContactView.viewerId", back_populates="viewer")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    height = Column(String, nullable=True)
    weight = Column(String, nullable=True)
    complexion = Column(String, nullable=True)
    maritalStatus = Column(String, default="Single")
    education = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    income = Column(String, nullable=True)
    gotra = Column(String, nullable=True)
    manglik = Column(Boolean, default=False)
    bio = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, default="India")
    nativePlace = Column(String, nullable=True)
    photos = Column(Text, nullable=True)
    isApprovedByAdmin = Column(Boolean, default=False)
    approvedAt = Column(DateTime, nullable=True)
    approvedBy = Column(Integer, nullable=True)
    isActive = Column(Boolean, default=True)
    profileViews = Column(Integer, default=0)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
    contactViews = relationship("ContactView", foreign_keys="ContactView.profileId", back_populates="profile")


class FamilyDetails(Base):
    __tablename__ = "family_details"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    fatherName = Column(String, nullable=True)
    fatherOccupation = Column(String, nullable=True)
    motherName = Column(String, nullable=True)
    motherOccupation = Column(String, nullable=True)
    siblings = Column(String, nullable=True)
    familyType = Column(String, nullable=True)
    familyBackground = Column(Text, nullable=True)
    familyIncome = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="familyDetails")


class KundliDetails(Base):
    __tablename__ = "kundli_details"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    birthDate = Column(DateTime, nullable=False)
    birthTime = Column(String, nullable=True)
    birthPlace = Column(String, nullable=True)
    rashi = Column(String, nullable=True)
    nakshatra = Column(String, nullable=True)
    gotra = Column(String, nullable=True)
    charanPaad = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="kundliDetails")


class Interest(Base):
    __tablename__ = "interests"
    __table_args__ = (UniqueConstraint("senderId", "receiverId"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    senderId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiverId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(InterestStatus, name="intereststatus"), default=InterestStatus.PENDING)
    message = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sender = relationship("User", foreign_keys=[senderId], back_populates="sentInterests")
    receiver = relationship("User", foreign_keys=[receiverId], back_populates="receivedInterests")


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    senderId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiverId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    isRead = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[senderId], back_populates="sentMessages")
    receiver = relationship("User", foreign_keys=[receiverId], back_populates="receivedMessages")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    planType = Column(Enum(PlanType, name="plantype"), nullable=False)
    startDate = Column(DateTime, default=datetime.utcnow)
    endDate = Column(DateTime, nullable=False)
    remainingViews = Column(Integer, default=0)
    status = Column(Enum(SubscriptionStatus, name="subscriptionstatus"), default=SubscriptionStatus.ACTIVE)
    paymentId = Column(Integer, ForeignKey("payments.id"), nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
    payment = relationship("Payment", back_populates="subscriptions", foreign_keys=[paymentId])


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    razorpayOrderId = Column(String, nullable=True)
    razorpayPaymentId = Column(String, nullable=True)
    razorpaySignature = Column(String, nullable=True)
    status = Column(Enum(PaymentStatus, name="paymentstatus"), default=PaymentStatus.PENDING)
    purpose = Column(String, nullable=True)
    metadata = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="payments")
    subscriptions = relationship("Subscription", back_populates="payment", foreign_keys="Subscription.paymentId")
    pdfFiles = relationship("PdfFile", back_populates="payment")


class PdfFile(Base):
    __tablename__ = "pdf_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(PdfType, name="pdftype"), nullable=False)
    fileUrl = Column(String, nullable=False)
    fileKey = Column(String, nullable=False)
    paymentId = Column(Integer, ForeignKey("payments.id"), nullable=True)
    metadata = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="pdfFiles")
    payment = relationship("Payment", back_populates="pdfFiles")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    to = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    template = Column(String, nullable=True)
    status = Column(String, default="pending")
    error = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="emailLogs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)
    isRead = Column(Boolean, default=False)
    data = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    imageUrl = Column(String, nullable=True)
    authorId = Column(Integer, nullable=True)
    isPublished = Column(Boolean, default=False)
    tags = Column(String, nullable=True)
    metaTitle = Column(String, nullable=True)
    metaDesc = Column(Text, nullable=True)
    viewCount = Column(Integer, default=0)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Gallery(Base):
    __tablename__ = "gallery"

    id = Column(Integer, primary_key=True, autoincrement=True)
    imageUrl = Column(String, nullable=False)
    imageKey = Column(String, nullable=False)
    category = Column(String, nullable=True)
    caption = Column(String, nullable=True)
    isActive = Column(Boolean, default=True)
    sortOrder = Column(Integer, default=0)
    createdAt = Column(DateTime, default=datetime.utcnow)


class OtpLog(Base):
    __tablename__ = "otp_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    target = Column(String, nullable=False)
    type = Column(String, nullable=False)
    otp = Column(String, nullable=False)
    expiresAt = Column(DateTime, nullable=False)
    isUsed = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.utcnow)


class ContactView(Base):
    __tablename__ = "contact_views"
    __table_args__ = (UniqueConstraint("viewerId", "profileId"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    viewerId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profileId = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)

    viewer = relationship("User", foreign_keys=[viewerId], back_populates="contactViewsGiven")
    profile = relationship("Profile", foreign_keys=[profileId], back_populates="contactViews")
