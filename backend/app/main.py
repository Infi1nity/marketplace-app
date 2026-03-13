from fastapi import FastAPI
from app.core.database import engine
from sqlalchemy import text
from app.core.database import SessionLocal


app = FastAPI(title="marketplace-app")

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