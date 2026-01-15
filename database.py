from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# باقي الكود كما هو
SQLALCHEMY_DATABASE_URL = "sqlite:///sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# إنشاء جلسة (Session) للتعامل مع البيانات
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# الأصل الذي سترث منه جميع الجداول (Models)
Base = declarative_base()

# دالة (Dependency) للحصول على جلسة قاعدة البيانات وإغلاقها تلقائياً
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:

        db.close()
