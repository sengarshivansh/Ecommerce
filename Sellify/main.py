from fastapi import FastAPI
from .database import engine, Base
from .routers.auth import router as auth_router
from .routers.product import router as product_router
from .routers.category import router as category_router
from .routers.cart import router as cart_router
# Import models so they're registered with Base before create_all
from . import model  # noqa: F401

app = FastAPI()

@app.get("/health_check")
def health():
    return {"status":"ok"}


app.include_router(auth_router)
app.include_router(product_router)
app.include_router(category_router)
app.include_router(cart_router)


Base.metadata.create_all(bind=engine)
