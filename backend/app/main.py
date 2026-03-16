from fastapi import FastAPI
from app.core.database import engine
from sqlalchemy import text
from app.core.database import SessionLocal
from fastapi.middleware.cors import CORSMiddleware 

from app.modules.products.router import router as product_router


app = FastAPI(title="marketplace-app")


origins = [
    "http://localhost:5173",      # Vite
    "http://127.0.0.1:5173",      # localhost через IP
    "http://localhost:3000", 
    # "https://для продакшена здесь домен должен быть потом"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,         # Разрешить куки/авторизацию
    allow_methods=["*"],            # Разрешить все методы (GET, POST, и т.д.)
    allow_headers=["*"],            # Разрешить все заголовки
)


@app.get('/')
def home():
    return {"Hello": "dasasdasdd"}

@app.get("/db-test")
async def test_db():
    try:
        with SessionLocal() as db:
            result = db.execute(text("SELECT 1")).scalar()
            return {"status": "connected", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)} 
    

app.include_router(product_router, prefix='/api/v1', tags=["Products"])  # 👈 вот так!