from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from modal import Notification, PrayerRequest
from community import PrayerCreate, PrayerResponse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from modal import User
from community import UserLogin, UserResponse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db  # تأكد من استيراد دالة الحصول على قاعدة البيانات
import modal    # تأكد من استيراد موديلات قاعدة البيانات
from community import PrayerResponse  # تأكد من استيراد السكيمات



router = APIRouter()


@router.post("/get-or-create-user", response_model=UserResponse)
def get_or_create_user(user_in: UserLogin, db: Session = Depends(get_db)):
    # إذا أرسل المستخدم اسماً، نبحث عنه
    if user_in.full_name:
        user = db.query(User).filter(User.full_name == user_in.full_name).first()
        if user:
            return user

    # إذا لم نجد مستخدماً أو لم يرسل اسماً، ننشئ مستخدماً جديداً (هوية جديدة)
    new_user = User(full_name=user_in.full_name or "فاعل خير")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/campaigns", response_model=list[PrayerResponse])
async def get_all_campaigns(db: Session = Depends(get_db)):
    # جلب جميع الحملات من جدول PrayerRequest
    campaigns = db.query(modal.PrayerRequest).all()
    return campaigns
# تأكد من وجود دالة مزامنة التسبيحات أيضاً
@router.post("/sync-praises/{user_id}")
async def sync_praises(user_id: int, count: int):
    return {"status": "success", "synced": count}

# Endpoint خاص لتحديث الاسم لاحقاً من الإعدادات
@router.put("/update-profile/{user_id}")
def update_profile(user_id: int, new_name: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    user.full_name = new_name
    db.commit()
    return {"status": "success", "new_name": user.full_name}

# 1. جلب جميع حملات الدعاء
@router.get("/", response_model=list[PrayerResponse])
def read_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(PrayerRequest).all()
    return campaigns

# 2. إنشاء حملة دعاء جديدة (طلب دعاء من غريب)
@router.post("/request-duaa", response_model=PrayerResponse)
def create_campaign(prayer: PrayerCreate, db: Session = Depends(get_db)):
    db_prayer = PrayerRequest(
        title=prayer.title,
        description=prayer.description,
        creator_name=prayer.creator_name
    )
    db.add(db_prayer)
    db.commit()
    db.refresh(db_prayer)
    return db_prayer
# app/routes/route.py
@router.post("/request-duaa", response_model=PrayerResponse)
def create_campaign(prayer: PrayerCreate, db: Session = Depends(get_db)):
    db_prayer = PrayerRequest(
        title=prayer.title,
        description=prayer.description,
        creator_name=prayer.creator_name,
        category=prayer.category, # حفظ النوع هنا
        target_count=prayer.target_count
    )
    db.add(db_prayer)
    db.commit()
    db.refresh(db_prayer)
    return db_prayer

@router.post("/pray/{prayer_id}")
def pray_for_someone(prayer_id: int, db: Session = Depends(get_db)):
    db_prayer = db.query(PrayerRequest).filter(PrayerRequest.id == prayer_id).first()
    if not db_prayer:
        raise HTTPException(status_code=404, detail="الحملة غير موجودة")
    
    if db_prayer.current_count < db_prayer.target_count:
        db_prayer.current_count += 1
        if db_prayer.current_count >= db_prayer.target_count:
            db_prayer.is_completed = True
            # إنشاء تنبيه لصاحب الطلب الأصلي
            new_notif = Notification(
                user_id=db_prayer.id,
                message=f"أبشر! تم إتمام حملة: {db_prayer.title} بفضل الله ثم فاعلي الخير",
                type="completion"
            )
            db.add(new_notif)
        db.commit()
        db.refresh(db_prayer)
    
    return {"message": "تمت الدعوة بنجاح", "new_count": db_prayer.current_count}

@router.get("/leaderboard", response_model=list[UserResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    # جلب المستخدمين وترتيبهم تنازلياً حسب إجمالي التسبيحات
    top_users = db.query(User).order_by(User.total_praises.desc()).limit(10).all()
    return top_users


@router.post("/increment-praise/{user_id}")
def increment_praise(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.total_praises += 1
        db.commit()
    return {"status": "success", "current_total": user.total_praises if user else 0}


@router.post("/call-for-help/{user_id}")
def call_for_help(user_id: int, remaining_count: int, db: Session = Depends(get_db)):
    user_sender = db.query(User).filter(User.id == user_id).first()
    
    # 1. جلب المستخدمين النشطين (مثلاً آخر 10 مسبحين في الليدربورد)
    active_users = db.query(User).filter(User.id != user_id).order_by(User.total_praises.desc()).limit(10).all()
    
    # 2. إرسال تنبيه لكل واحد منهم
    for active_user in active_users:
        help_notif = Notification(
            user_id=active_user.id,
            message=f"أخوك {user_sender.full_name} يحتاج عونك لإتمام {remaining_count} تسبيحة، هل تعينه؟",
            type="help_request"
        )
        db.add(help_notif)
    
    db.commit()
    return {"status": "تم إرسال نداء الاستغاثة لفاعلي الخير"}

@router.get("/check-reminders/{user_id}")
def check_reminders(user_id: int, db: Session = Depends(get_db)):
    # البحث عن حملات لم تكتمل لهذا المستخدم
    incomplete = db.query(PrayerRequest).filter(
        PrayerRequest.id == id, 
        PrayerRequest.is_completed == False
    ).all()
    
    if incomplete:
        return {
            "has_reminder": True,
            "message": f"لديك {len(incomplete)} أوراد لم تكتمل بعد، هل تريد إكمالها الآن؟"
        }
    return {"has_reminder": False}

@router.get("/check-sync/{user_id}")
def check_sync(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"last_server_update": 0}
    
    # تحويل الوقت لـ Timestamp لسهولة المقارنة في الفرونت إند
    return {"last_server_update": user.last_update.timestamp()}
@router.post("/contribute/{campaign_id}")
async def contribute_to_campaign(campaign_id: int, count: int, db: Session = Depends(get_db)):
    campaign = db.query(modal.PrayerRequest).filter(modal.PrayerRequest.id == campaign_id).first()
    if not campaign:
        return {"error": "الحملة غير موجودة"}
    
    # إضافة العدد الجديد للعدد الحالي
    campaign.current_count += count
    db.commit()
    db.refresh(campaign)
    return {"status": "success", "new_total": campaign.current_count}