from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import uvicorn

from app.database import engine, Base, AsyncSessionLocal
from app.config import settings

# Импортируем все роутеры (работают с PostgreSQL)
from app.routers import auth, products, orders, payment, bonus, admin, ai


# Логин и пароль администратора (вводятся в форме входа вместо телефона)
ADMIN_PHONE = "админ123"
ADMIN_PASSWORD = "127845"


async def seed_admin():
    """Создаёт администратора при первом запуске, если его ещё нет."""
    from sqlalchemy import select
    from app.models import User, UserRole, UserTariff
    from app.auth import get_password_hash
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.phone == ADMIN_PHONE))
        if res.scalar_one_or_none():
            return
        admin = User(
            name="Администратор",
            phone=ADMIN_PHONE,
            email="admin@agroverse.uz",
            password_hash=get_password_hash(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            tariff=UserTariff.PREMIUM,
            bonus_points=0,
            is_active=True,
        )
        db.add(admin)
        await db.commit()
        print(f"👑 Админ создан — логин: {ADMIN_PHONE}, пароль: {ADMIN_PASSWORD}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # При старте: создаём таблицы в PostgreSQL, если их ещё нет
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # авто-миграция: колонка причины блокировки для существующей БД
        from sqlalchemy import text
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS block_reason TEXT"))
    # Создаём админа, если его ещё нет (логин: админ123, пароль: 127845)
    await seed_admin()
    print("🌾 AgroVerse API запущен на http://127.0.0.1:8000")
    print("📚 API Docs: http://127.0.0.1:8000/docs")
    print("🗄️  Данные сохраняются в PostgreSQL (видно в pgAdmin)")
    print("✅ CORS настроен правильно")
    yield
    # При остановке
    await engine.dispose()


app = FastAPI(title="AgroVerse API", version="2.0", lifespan=lifespan)

# CORS: без "*" вместе с credentials=True (иначе браузер блокирует)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Раздача загруженных файлов (фото товаров)
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Подключаем все роутеры — теперь данные идут в PostgreSQL, а не в память
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payment.router)
app.include_router(bonus.router)
app.include_router(admin.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    return {"message": "🌾 AgroVerse API", "version": "2.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    # reload=False для стабильного запуска через .bat/.ps1
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
