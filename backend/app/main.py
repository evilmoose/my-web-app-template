"""
FastAPI application entry point.
""" 

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_users import schemas
from app.core.config import settings

# add routers
from app.api.leads import router as leads_router
from app.api.users import auth_backend, fastapi_users
from app.api.blogs import router as blog_router
from app.api.upload import router as upload_router
from app.api.project import router as project_router


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files directory for uploads
# Make sure to set check_dir=False to avoid issues with directory permissions
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR, check_dir=False), name="uploads")


# User schemas
class UserRead(schemas.BaseUser[int]):
    """User read schema."""
    first_name: str | None = None
    last_name: str | None = None


class UserCreate(schemas.BaseUserCreate):
    """User create schema."""
    first_name: str | None = None
    last_name: str | None = None


class UserUpdate(schemas.BaseUserUpdate):
    """User update schema."""
    first_name: str | None = None
    last_name: str | None = None


# Include user routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix=f"{settings.API_V1_STR}/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix=f"{settings.API_V1_STR}/users",
    tags=["users"],
)


# Include lead routes
app.include_router(
    leads_router,
    prefix=f"{settings.API_V1_STR}/leads",
    tags=["leads"],
)

# Include blog routes
app.include_router(
    blog_router,
    prefix=f"{settings.API_V1_STR}/blogs",
    tags=["blogs"],
)

# Include upload routes
app.include_router(
    upload_router,
    prefix=f"{settings.API_V1_STR}/upload",
    tags=["upload"],
)

# Include project routes
app.include_router(
    project_router,
    prefix=f"{settings.API_V1_STR}/projects",
    tags=["projects"],
)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to Art of Workflows API"} 
