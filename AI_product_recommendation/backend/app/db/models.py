"""
SQLAlchemy database models
"""
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql.sqltypes import Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import CHAR
import uuid

from app.core.database import Base


def generate_uuid():
    """Generate UUID string"""
    return str(uuid.uuid4())


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    user_id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    last_login = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    views = relationship("UserView", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("UserLike", back_populates="user", cascade="all, delete-orphan")
    purchases = relationship("UserPurchase", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("UserRecommendation", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    """Product category model"""
    __tablename__ = "categories"
    
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    category_name = Column(String(100), unique=True, nullable=False)
    parent_category_id = Column(Integer, ForeignKey("categories.category_id"))
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Self-referential relationship
    parent = relationship("Category", remote_side=[category_id])
    children = relationship("Category")
    
    # Products relationship
    products = relationship("Product", back_populates="category")


class Product(Base):
    """Product model"""
    __tablename__ = "products"
    
    product_id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(Text)
    brand = Column(String(100))
    rating = Column(Numeric(3, 2), default=0)
    review_count = Column(Integer, default=0)
    image_url = Column(String(500))
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    category = relationship("Category", back_populates="products")
    views = relationship("UserView", back_populates="product", cascade="all, delete-orphan")
    likes = relationship("UserLike", back_populates="product", cascade="all, delete-orphan")
    purchases = relationship("UserPurchase", back_populates="product", cascade="all, delete-orphan")
    similarities_1 = relationship("ProductSimilarity", foreign_keys="ProductSimilarity.product_id_1", cascade="all, delete-orphan")
    similarities_2 = relationship("ProductSimilarity", foreign_keys="ProductSimilarity.product_id_2", cascade="all, delete-orphan")
    recommendations = relationship("UserRecommendation", back_populates="product", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_category', 'category_id'),
        Index('idx_price', 'price'),
        Index('idx_rating', 'rating'),
        Index('idx_active', 'is_active'),
    )


class UserView(Base):
    """User product view tracking model"""
    __tablename__ = "user_views"

    view_id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    user_id = Column(CHAR(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(CHAR(36), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    viewed_at = Column(DateTime, default=func.current_timestamp())
    duration_seconds = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="views")
    product = relationship("Product", back_populates="views")

    # Indexes
    __table_args__ = (
        Index('idx_user_product', 'user_id', 'product_id'),
        Index('idx_viewed_at', 'viewed_at'),
    )


class UserLike(Base):
    """User product like model"""
    __tablename__ = "user_likes"

    like_id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    user_id = Column(CHAR(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(CHAR(36), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    liked_at = Column(DateTime, default=func.current_timestamp())
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="likes")
    product = relationship("Product", back_populates="likes")

    # Indexes
    __table_args__ = (
        Index('idx_user_like', 'user_id', 'product_id', unique=True),
        Index('idx_user_active', 'user_id', 'is_active'),
    )


class UserPurchase(Base):
    """User product purchase model"""
    __tablename__ = "user_purchases"

    purchase_id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    user_id = Column(CHAR(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(CHAR(36), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    purchased_at = Column(DateTime, default=func.current_timestamp())

    # Relationships
    user = relationship("User", back_populates="purchases")
    product = relationship("Product", back_populates="purchases")

    # Indexes
    __table_args__ = (
        Index('idx_user_purchase', 'user_id'),
        Index('idx_purchased_at', 'purchased_at'),
    )


class ProductSimilarity(Base):
    """Product similarity model for content-based filtering"""
    __tablename__ = "product_similarities"

    similarity_id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    product_id_1 = Column(CHAR(36), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    product_id_2 = Column(CHAR(36), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    similarity_score = Column(Numeric(5, 4), nullable=False)
    algorithm_type = Column(String(50), default="content_based")
    calculated_at = Column(DateTime, default=func.current_timestamp())

    # Relationships
    product_1 = relationship("Product", foreign_keys=[product_id_1])
    product_2 = relationship("Product", foreign_keys=[product_id_2])

    # Indexes
    __table_args__ = (
        Index('idx_product_pair', 'product_id_1', 'product_id_2', unique=True),
        Index('idx_product1', 'product_id_1'),
        Index('idx_similarity_score', 'similarity_score'),
    )


class UserRecommendation(Base):
    """User recommendation cache model"""
    __tablename__ = "user_recommendations"

    recommendation_id = Column(CHAR(36), primary_key=True, default=generate_uuid)
    user_id = Column(CHAR(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(CHAR(36), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    recommendation_score = Column(Numeric(5, 4), nullable=False)
    algorithm_used = Column(String(50), nullable=False)
    generated_at = Column(DateTime, default=func.current_timestamp())
    expires_at = Column(DateTime)
    is_clicked = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="recommendations")
    product = relationship("Product", back_populates="recommendations")

    # Indexes
    __table_args__ = (
        Index('idx_user_expires', 'user_id', 'expires_at'),
        Index('idx_recommendation_score', 'recommendation_score'),
    )
