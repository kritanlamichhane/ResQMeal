import asyncio
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.v1 import auth, listings, reservations, notifications, ai, analytics, admin
from app.services.expiration_service import ExpirationService
from seed_data import seed_database

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("ResQMeal")

async def background_reservation_cleaner():
    """Background asynchronous task that periodically releases expired reservation inventory."""
    while True:
        try:
            db = SessionLocal()
            stats = ExpirationService.process_expired_reservations_and_listings(db)
            db.close()
            if stats["expired_reservations"] > 0 or stats["expired_listings"] > 0:
                logger.info(f"Background Expiration Worker: {stats}")
        except Exception as e:
            logger.error(f"Error in background cleaner: {e}")
        await asyncio.sleep(60) # Run every 60 seconds

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing ResQMeal database and models...")
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        logger.warning(f"Seed database note: {e}")

    # Start background cleaner worker
    cleaner_task = asyncio.create_task(background_reservation_cleaner())
    yield
    # Shutdown
    cleaner_task.cancel()
    logger.info("ResQMeal backend shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ResQMeal: Real-world food surplus reduction platform connecting Providers, Consumers, and NGOs.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins for seamless client connection
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized Error Handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code_str = "HTTP_ERROR"
    if exc.status_code == 409:
        code_str = "INSUFFICIENT_INVENTORY"
    elif exc.status_code == 404:
        code_str = "NOT_FOUND"
    elif exc.status_code == 401:
        code_str = "UNAUTHORIZED"
    elif exc.status_code == 403:
        code_str = "FORBIDDEN"
    elif exc.status_code == 429:
        code_str = "RATE_LIMIT_EXCEEDED"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "timestamp": datetime.utcnow().isoformat(),
            "status": exc.status_code,
            "code": code_str,
            "message": exc.detail,
            "path": request.url.path
        }
    )

# Mount Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(listings.router, prefix=f"{settings.API_V1_STR}/listings", tags=["Food Listings"])
app.include_router(reservations.router, prefix=f"{settings.API_V1_STR}/reservations", tags=["Reservations & Concurrency"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI & Machine Learning"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Impact Analytics"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Administration & Health"])

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "ResQMeal Backend API",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/", tags=["System"])
def root():
    return {
        "project": "ResQMeal",
        "description": "Food surplus reduction platform",
        "documentation": "/docs",
        "health": "/health"
    }
