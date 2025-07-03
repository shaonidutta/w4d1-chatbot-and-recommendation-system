"""
Product schemas for request/response validation
"""
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class CategoryResponse(BaseModel):
    """Schema for category response"""
    category_id: int
    category_name: str
    parent_category_id: Optional[int]
    description: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    """Base product schema"""
    name: str
    price: float
    description: Optional[str] = ""
    brand: Optional[str] = ""
    rating: Optional[float] = 0.0
    image_url: Optional[str] = ""
    stock_quantity: Optional[int] = 0
    is_active: Optional[bool] = True


class ProductResponse(ProductBase):
    """Schema for product response"""
    product_id: str
    category_id: Optional[int]
    category: Optional[CategoryResponse]
    review_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """Schema for paginated product list response"""
    products: List[ProductResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool


class ProductSearchQuery(BaseModel):
    """Schema for product search query"""
    query: Optional[str] = ""
    category_id: Optional[int] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    brand: Optional[str] = None
    sort_by: Optional[str] = "name"  # name, price, rating, created_at
    sort_order: Optional[str] = "asc"  # asc, desc
    page: Optional[int] = 1
    per_page: Optional[int] = 20
    
    @validator('sort_by')
    def validate_sort_by(cls, v):
        allowed_sorts = ['name', 'price', 'rating', 'created_at']
        if v not in allowed_sorts:
            raise ValueError(f'sort_by must be one of: {allowed_sorts}')
        return v
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v not in ['asc', 'desc']:
            raise ValueError('sort_order must be "asc" or "desc"')
        return v
    
    @validator('page')
    def validate_page(cls, v):
        if v < 1:
            raise ValueError('page must be >= 1')
        return v
    
    @validator('per_page')
    def validate_per_page(cls, v):
        if v < 1 or v > 100:
            raise ValueError('per_page must be between 1 and 100')
        return v


class ProductInteraction(BaseModel):
    """Schema for product interaction tracking"""
    duration_seconds: Optional[int] = 0


class ProductLikeResponse(BaseModel):
    """Schema for product like response"""
    product_id: str
    is_liked: bool
    total_likes: int


class TrendingProductsResponse(BaseModel):
    """Schema for trending products response"""
    products: List[ProductResponse]
    period: str  # daily, weekly, monthly
    generated_at: datetime
