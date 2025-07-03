"""
Product service for managing products and categories
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc, func, text
from fastapi import HTTPException, status
from loguru import logger

from app.db.models import Product, Category, UserView, UserLike, UserPurchase
from app.schemas.products import ProductSearchQuery


class ProductService:
    """Service for handling product operations"""
    
    @staticmethod
    def get_products_paginated(
        db: Session, 
        page: int = 1, 
        per_page: int = 20,
        category_id: Optional[int] = None,
        search_query: Optional[str] = None
    ) -> Tuple[List[Product], int]:
        """Get paginated products with optional filtering"""
        try:
            query = db.query(Product).options(joinedload(Product.category))
            
            # Apply filters
            if category_id:
                query = query.filter(Product.category_id == category_id)
            
            if search_query:
                # Use full-text search if available, otherwise use LIKE
                search_filter = or_(
                    Product.name.contains(search_query),
                    Product.description.contains(search_query),
                    Product.brand.contains(search_query)
                )
                query = query.filter(search_filter)
            
            # Only active products
            query = query.filter(Product.is_active == True)
            
            # Get total count
            total = query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            products = query.offset(offset).limit(per_page).all()
            
            return products, total
            
        except Exception as e:
            logger.error(f"Error getting paginated products: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve products"
            )
    
    @staticmethod
    def search_products(db: Session, search_params: ProductSearchQuery) -> Tuple[List[Product], int]:
        """Advanced product search with multiple filters"""
        try:
            query = db.query(Product).options(joinedload(Product.category))
            
            # Text search
            if search_params.query:
                search_filter = or_(
                    Product.name.contains(search_params.query),
                    Product.description.contains(search_params.query),
                    Product.brand.contains(search_params.query)
                )
                query = query.filter(search_filter)
            
            # Category filter
            if search_params.category_id:
                query = query.filter(Product.category_id == search_params.category_id)
            
            # Price range filter
            if search_params.min_price is not None:
                query = query.filter(Product.price >= search_params.min_price)
            if search_params.max_price is not None:
                query = query.filter(Product.price <= search_params.max_price)
            
            # Rating filter
            if search_params.min_rating is not None:
                query = query.filter(Product.rating >= search_params.min_rating)
            
            # Brand filter
            if search_params.brand:
                query = query.filter(Product.brand.ilike(f"%{search_params.brand}%"))
            
            # Only active products
            query = query.filter(Product.is_active == True)
            
            # Sorting
            sort_column = getattr(Product, search_params.sort_by)
            if search_params.sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
            
            # Get total count
            total = query.count()
            
            # Apply pagination
            offset = (search_params.page - 1) * search_params.per_page
            products = query.offset(offset).limit(search_params.per_page).all()
            
            return products, total
            
        except Exception as e:
            logger.error(f"Error searching products: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to search products"
            )
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
        """Get product by ID"""
        try:
            return db.query(Product).options(joinedload(Product.category)).filter(
                and_(Product.product_id == product_id, Product.is_active == True)
            ).first()
        except Exception as e:
            logger.error(f"Error getting product by ID: {e}")
            return None
    
    @staticmethod
    def get_products_by_category(db: Session, category_id: int, page: int = 1, per_page: int = 20) -> Tuple[List[Product], int]:
        """Get products by category with pagination"""
        try:
            query = db.query(Product).options(joinedload(Product.category)).filter(
                and_(Product.category_id == category_id, Product.is_active == True)
            )
            
            total = query.count()
            offset = (page - 1) * per_page
            products = query.offset(offset).limit(per_page).all()
            
            return products, total
            
        except Exception as e:
            logger.error(f"Error getting products by category: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve products by category"
            )
    
    @staticmethod
    def get_categories(db: Session) -> List[Category]:
        """Get all active categories"""
        try:
            return db.query(Category).filter(Category.is_active == True).all()
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            return []
    
    @staticmethod
    def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
        """Get category by ID"""
        try:
            return db.query(Category).filter(
                and_(Category.category_id == category_id, Category.is_active == True)
            ).first()
        except Exception as e:
            logger.error(f"Error getting category by ID: {e}")
            return None
    
    @staticmethod
    def track_product_view(db: Session, user_id: str, product_id: str, duration_seconds: int = 0) -> bool:
        """Track user product view"""
        try:
            view = UserView(
                user_id=user_id,
                product_id=product_id,
                duration_seconds=duration_seconds
            )
            db.add(view)
            db.commit()
            
            logger.info(f"Tracked view: user {user_id} viewed product {product_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error tracking product view: {e}")
            return False
    
    @staticmethod
    def toggle_product_like(db: Session, user_id: str, product_id: str) -> Tuple[bool, int]:
        """Toggle product like status and return (is_liked, total_likes)"""
        try:
            # Check if user already liked this product
            existing_like = db.query(UserLike).filter(
                and_(UserLike.user_id == user_id, UserLike.product_id == product_id)
            ).first()
            
            if existing_like:
                # Toggle the like status
                existing_like.is_active = not existing_like.is_active
                is_liked = existing_like.is_active
            else:
                # Create new like
                new_like = UserLike(
                    user_id=user_id,
                    product_id=product_id,
                    is_active=True
                )
                db.add(new_like)
                is_liked = True
            
            db.commit()
            
            # Get total likes for this product
            total_likes = db.query(UserLike).filter(
                and_(UserLike.product_id == product_id, UserLike.is_active == True)
            ).count()
            
            logger.info(f"Toggled like: user {user_id} {'liked' if is_liked else 'unliked'} product {product_id}")
            return is_liked, total_likes
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error toggling product like: {e}")
            return False, 0
    
    @staticmethod
    def get_trending_products(db: Session, limit: int = 10, days: int = 7) -> List[Product]:
        """Get trending products based on recent views and likes"""
        try:
            # Get products with most interactions in the last N days
            from datetime import datetime, timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Subquery for view counts
            view_counts = db.query(
                UserView.product_id,
                func.count(UserView.view_id).label('view_count')
            ).filter(UserView.viewed_at >= cutoff_date).group_by(UserView.product_id).subquery()
            
            # Subquery for like counts
            like_counts = db.query(
                UserLike.product_id,
                func.count(UserLike.like_id).label('like_count')
            ).filter(
                and_(UserLike.liked_at >= cutoff_date, UserLike.is_active == True)
            ).group_by(UserLike.product_id).subquery()
            
            # Main query to get trending products
            trending_query = db.query(Product).options(joinedload(Product.category)).outerjoin(
                view_counts, Product.product_id == view_counts.c.product_id
            ).outerjoin(
                like_counts, Product.product_id == like_counts.c.product_id
            ).filter(Product.is_active == True)
            
            # Order by combined score (views + likes * 2)
            trending_query = trending_query.order_by(
                desc(
                    func.coalesce(view_counts.c.view_count, 0) + 
                    func.coalesce(like_counts.c.like_count, 0) * 2
                )
            )
            
            return trending_query.limit(limit).all()
            
        except Exception as e:
            logger.error(f"Error getting trending products: {e}")
            return []
