"""
Recommendation endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.products import ProductResponse
from app.services.recommendation_service import recommendation_service
from app.services.product_service import ProductService
from app.api.dependencies import get_current_user, get_optional_current_user
from app.db.models import User, Product, UserView, UserLike, UserPurchase

router = APIRouter()


@router.get("/similar/{product_id}", response_model=List[ProductResponse])
async def get_similar_products(
    product_id: str,
    limit: int = Query(10, ge=1, le=50, description="Number of similar products"),
    db: Session = Depends(get_db)
):
    """Get similar products based on content similarity"""
    try:
        # Check if product exists
        product = ProductService.get_product_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Get similar products
        similar_products = recommendation_service.get_similar_products(
            db, product_id, limit
        )

        # Get full product details
        result = []
        for similar in similar_products:
            product = ProductService.get_product_by_id(db, similar['product_id'])
            if product:
                result.append(ProductResponse.from_orm(product))

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get similar products"
        )


@router.get("/user/me", response_model=List[ProductResponse])
async def get_my_recommendations(
    limit: int = Query(20, ge=1, le=100, description="Number of recommendations"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized recommendations for current user"""
    try:
        # Get user recommendations
        recommendations = recommendation_service.get_user_recommendations(
            db, current_user.user_id, limit
        )

        # Get full product details
        result = []
        for rec in recommendations:
            product = ProductService.get_product_by_id(db, rec['product_id'])
            if product:
                result.append(ProductResponse.from_orm(product))

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user recommendations"
        )


@router.get("/trending", response_model=List[ProductResponse])
async def get_trending_products(
    limit: int = Query(10, ge=1, le=50, description="Number of trending products"),
    days: int = Query(7, ge=1, le=30, description="Days to look back"),
    db: Session = Depends(get_db)
):
    """Get trending products based on recent interactions"""
    try:
        products = ProductService.get_trending_products(db, limit, days)
        return [ProductResponse.from_orm(p) for p in products]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get trending products"
        )


@router.post("/rebuild")
async def rebuild_recommendations(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Rebuild recommendation model"""
    try:
        # Add rebuild task to background
        background_tasks.add_task(recommendation_service.rebuild_recommendations)

        return {
            "message": "Recommendation rebuild started in background",
            "status": "processing"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start recommendation rebuild"
        )


@router.post("/feedback")
async def submit_recommendation_feedback():
    """Submit feedback on recommendations"""
    return {"message": "Submit feedback endpoint - to be implemented"}
