"""
Product management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from app.core.database import get_db
from app.schemas.products import (
    ProductResponse, ProductListResponse, ProductSearchQuery,
    ProductInteraction, ProductLikeResponse, CategoryResponse
)
from app.services.product_service import ProductService
from app.api.dependencies import get_current_user, get_optional_current_user
from app.db.models import User

router = APIRouter()


@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db)
):
    """Get products with pagination and filtering"""
    try:
        products, total = ProductService.get_products_paginated(
            db, page, per_page, category_id, search
        )

        total_pages = math.ceil(total / per_page)

        return ProductListResponse(
            products=[ProductResponse.from_orm(p) for p in products],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve products"
        )


@router.get("/search", response_model=ProductListResponse)
async def search_products(
    query: Optional[str] = Query("", description="Search query"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    sort_by: str = Query("name", description="Sort by field"),
    sort_order: str = Query("asc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Advanced product search with filters"""
    try:
        search_params = ProductSearchQuery(
            query=query,
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            brand=brand,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            per_page=per_page
        )

        products, total = ProductService.search_products(db, search_params)
        total_pages = math.ceil(total / per_page)

        return ProductListResponse(
            products=[ProductResponse.from_orm(p) for p in products],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search products"
        )


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """Get all product categories"""
    try:
        categories = ProductService.get_categories(db)
        return [CategoryResponse.from_orm(c) for c in categories]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve categories"
        )


@router.get("/trending", response_model=list[ProductResponse])
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
            detail="Failed to retrieve trending products"
        )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get single product by ID"""
    try:
        product = ProductService.get_product_by_id(db, product_id)

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        return ProductResponse.from_orm(product)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve product"
        )


@router.get("/category/{category_id}", response_model=ProductListResponse)
async def get_products_by_category(
    category_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get products by category"""
    try:
        products, total = ProductService.get_products_by_category(
            db, category_id, page, per_page
        )

        total_pages = math.ceil(total / per_page)

        return ProductListResponse(
            products=[ProductResponse.from_orm(p) for p in products],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve products by category"
        )


@router.post("/{product_id}/view")
async def track_product_view(
    product_id: str,
    interaction: ProductInteraction,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Track product view"""
    try:
        # Check if product exists
        product = ProductService.get_product_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Track view only if user is authenticated
        if current_user:
            success = ProductService.track_product_view(
                db, current_user.user_id, product_id, interaction.duration_seconds
            )

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to track view"
                )

        return {"message": "View tracked successfully", "product_id": product_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to track product view"
        )


@router.post("/{product_id}/like", response_model=ProductLikeResponse)
async def toggle_product_like(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like/unlike product"""
    try:
        # Check if product exists
        product = ProductService.get_product_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Toggle like
        is_liked, total_likes = ProductService.toggle_product_like(
            db, current_user.user_id, product_id
        )

        return ProductLikeResponse(
            product_id=product_id,
            is_liked=is_liked,
            total_likes=total_likes
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle product like"
        )
