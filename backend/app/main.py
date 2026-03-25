from fastapi import FastAPI
from app.core.database import engine
from sqlalchemy import text
from app.core.database import SessionLocal
from fastapi.middleware.cors import CORSMiddleware 

from app.modules.products.router import product_router, category_router
from app.modules.users.router import router as users_router
from app.modules.cart.router import router as cart_router
from app.modules.favorites.router import router as favorites_router
from app.modules.orders.router import router as orders_router

app = FastAPI(title="marketplace-app")


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "*",  # Для разработки - разрешаем все источники
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def home():
    return {"Hello": "marketplace"}

@app.get("/db-test")
async def test_db():
    try:
        with SessionLocal() as db:
            result = db.execute(text("SELECT 1")).scalar()
            return {"status": "connected", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)} 
    

app.include_router(product_router, prefix='/api/v1', tags=["Products"])
app.include_router(category_router, prefix='/api/v1', tags=["Categories"])
app.include_router(users_router, prefix='/api/v1', tags=["Auth"])
app.include_router(cart_router, prefix='/api/v1', tags=["Cart"])
app.include_router(favorites_router, prefix='/api/v1', tags=["Favorites"])
app.include_router(orders_router, prefix="/api/v1", tags=["Orders"])
