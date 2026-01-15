from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
# استيراد الـ router من المسار الذي حددته في صورتك
from route import router as community_router
from database import engine
import modal
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from websocket_manager import manager
# إنشاء الجداول في قاعدة البيانات عند تشغيل التطبيق
modal.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="تطبيق مستجاب - API",
    description="النظام الخلفي لمنصة الاستغفار وحملات الـ 40 غريب",
    version="1.0.0"
)

# 1. إعدادات الـ CORS: ضرورية جداً بما أننا فصلنا الـ Frontend
# تسمح للموبايل والمتصفح بالوصول للـ API دون قيود أمنية أثناء التطوير
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في الإنتاج نحدد دومين الـ PWA فقط
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





@app.websocket("/ws/help")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # استقبال البيانات من أي مستخدم
            data = await websocket.receive_json()
            
            # إذا كانت الرسالة هي نقرة تسبيح على حملة معينة
            if data.get("type") == "PRAISE_CLICK":
                campaign_id = data.get("campaign_id")
                amount = data.get("amount", 1)
                
                # هنا نقوم بالبث للجميع لإبلاغهم بالتحديث
                await manager.broadcast({
                    "type": "UPDATE_COUNT",
                    "campaign_id": campaign_id,
                    "added_amount": amount
                })
                
            # إذا كانت رسالة استغاثة (طلب مساعدة جديد)
            elif data.get("type") == "HELP_REQUEST":
                await manager.broadcast(data)
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        manager.disconnect(websocket)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Tasbeh API v1",
        "status": "Active",
        "docs": "/docs"  # رابط التوثيق التفاعلي Swagger
    }

