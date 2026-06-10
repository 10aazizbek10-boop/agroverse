from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI(title="AgroVerse API", version="2.0")

# Request models
class LoginRequest(BaseModel):
    phone: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    phone: str
    password: str
    email: str
    role: str = "xaridor"

class CreateProductRequest(BaseModel):
    title: str
    description: str
    price_per_unit: float
    quantity_available: int

class CreateOrderRequest(BaseModel):
    product_id: int
    quantity: int

# CORS - ЯВНО прописываем
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Mock database
users_db = {}
products_db = {}
orders_db = {}

def generate_token():
    import uuid
    return str(uuid.uuid4())

@app.get("/")
async def root():
    return {"message": "🌾 AgroVerse API", "version": "2.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# AUTH ENDPOINTS
@app.post("/api/auth/register")
async def register(data: RegisterRequest):
    name = data.name
    phone = data.phone
    password = data.password
    email = data.email
    role = data.role
    
    if not name or not phone or not password:
        raise HTTPException(status_code=422, detail="Missing required fields")
    
    if phone in users_db:
        raise HTTPException(status_code=400, detail="Phone already registered")
    
    user_id = len(users_db) + 1
    token = generate_token()
    
    users_db[phone] = {
        "id": user_id,
        "name": name,
        "phone": phone,
        "email": email,
        "password": password,
        "role": role,
        "token": token,
        "created_at": datetime.now().isoformat()
    }
    
    return {
        "access_token": token,
        "refresh_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": name,
            "phone": phone,
            "email": email,
            "role": role
        }
    }

@app.post("/api/auth/login")
async def login(data: LoginRequest):
    phone = data.phone
    password = data.password
    
    if phone not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = users_db[phone]
    if user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "access_token": user["token"],
        "refresh_token": user["token"],
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "phone": user["phone"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@app.get("/api/auth/me")
async def get_me(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    
    for phone, user in users_db.items():
        if user["token"] == token:
            return {
                "id": user["id"],
                "name": user["name"],
                "phone": user["phone"],
                "email": user["email"],
                "role": user["role"]
            }
    
    raise HTTPException(status_code=401, detail="Invalid token")

# PRODUCTS ENDPOINTS
@app.get("/api/products")
async def get_products():
    return {
        "total": len(products_db),
        "page": 1,
        "limit": 10,
        "products": list(products_db.values())
    }

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    if product_id in products_db:
        return products_db[product_id]
    raise HTTPException(status_code=404, detail="Product not found")

@app.post("/api/products")
async def create_product(data: CreateProductRequest):
    product_id = len(products_db) + 1
    product = {
        "id": product_id,
        "title": data.title,
        "description": data.description,
        "price": data.price_per_unit,
        "quantity": data.quantity_available,
        "status": "active"
    }
    products_db[product_id] = product
    return product

# ORDERS ENDPOINTS
@app.get("/api/orders/my")
async def get_my_orders():
    return {"orders": list(orders_db.values())}

@app.post("/api/orders")
async def create_order(data: CreateOrderRequest):
    order_id = len(orders_db) + 1
    order = {
        "id": order_id,
        "product_id": data.product_id,
        "quantity": data.quantity,
        "status": "created"
    }
    orders_db[order_id] = order
    return order

# PAYMENT ENDPOINTS
@app.get("/api/payment/wallet")
async def get_wallet():
    return {
        "balance": 0,
        "currency": "UZS"
    }

@app.on_event("startup")
async def startup():
    print("🌾 AgroVerse API запущен на http://127.0.0.1:8000")
    print("📚 API Docs: http://127.0.0.1:8000/docs")
    print("✅ CORS включен для http://127.0.0.1:5500")

if __name__ == "__main__":
    import uvicorn
    # reload=False + app объект => стабильный запуск без import-string warning
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
