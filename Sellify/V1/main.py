from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers.auth import router as auth_router
from .routers.product import router as product_router
from .routers.category import router as category_router
from .routers.cart import router as cart_router
from .routers.order import router as order_router
# Import models so they're registered with Base before create_all
from . import model  # noqa: F401

from dotenv import load_dotenv
from contextlib import asynccontextmanager
from sqlalchemy.exc import OperationalError
import asyncio
import logging
import os

load_dotenv()

log = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables at startup, retrying if the database is briefly unreachable.

    This used to run at import time, so a single dropped connection made the
    whole service fail to boot. Now a blip costs us a few seconds, not the deploy.
    """
    for attempt in range(1, 6):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except OperationalError as exc:
            wait = 2 ** attempt
            log.warning("database not reachable (attempt %d/5): %s — retrying in %ds", attempt, exc, wait)
            await asyncio.sleep(wait)
    else:
        log.error("database still unreachable after 5 attempts; starting anyway")
    yield


app = FastAPI(title="Sellify API", lifespan=lifespan)

# CORS — let the browser frontend call this API.
# Explicit production origins go in FRONTEND_ORIGINS (comma-separated). In local
# dev, Vite may pick any port (5173, 5174, ...), so we also allow any localhost
# port via a regex. The regex only matches localhost/127.0.0.1, so it is harmless
# in production.
_origins = [o.strip() for o in os.getenv("FRONTEND_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health_check")
def health():
    return {"status":"ok"}


app.include_router(auth_router)
app.include_router(product_router)
app.include_router(category_router)
app.include_router(cart_router)
app.include_router(order_router)
