from fastapi import FastAPI

app = FastAPI(title="marketplace-app")

@app.get('/')
def home():
    return {"Hello": "MarketPlace"}