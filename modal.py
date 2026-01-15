from sqlalchemy import Column, Integer, String, ForeignKey, Boolean ,DateTime
from database import Base
from datetime import datetime 

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=True, default="فاعل خير")  # الاسم الذي سيدخله المستخدم
    total_praises = Column(Integer, default=0) # إجمالي تسبيحاته لرفع روحه المعنوية
    last_update = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PrayerRequest(Base):
    __tablename__ = "prayer_requests"

    id = Column(Integer, primary_key=True, index=True)
    creator_name = Column(String)
    title = Column(String)  # مثلاً: حملة استغفار عامة
    description = Column(String) # مثلاً: في سبيل هطول المطر
    category = Column(String) # (دعاء لشخص، استغفار، تيسير أمر)
    current_count = Column(Integer, default=0)
    target_count = Column(Integer, default=40)
    is_completed = Column(Boolean, default=False)

   

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # المستخدم المستهدف
    message = Column(String)
    is_read = Column(Boolean, default=False)
    type = Column(String) # 'completion' أو 'reminder' أو 'help_request'