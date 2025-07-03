"""
Main API router for v1 endpoints
"""
from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, products, recommendations, users

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
