"""
Authentication service for user management
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from loguru import logger

from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.db.models import User
from app.schemas.auth import UserRegistration, UserLogin


class AuthService:
    """Service for handling authentication operations"""
    
    @staticmethod
    def register_user(db: Session, user_data: UserRegistration) -> User:
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = db.query(User).filter(
                (User.email == user_data.email) | (User.username == user_data.username)
            ).first()
            
            if existing_user:
                if existing_user.email == user_data.email:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already registered"
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Username already taken"
                    )
            
            # Hash password
            hashed_password = get_password_hash(user_data.password)
            
            # Create new user
            new_user = User(
                username=user_data.username,
                email=user_data.email,
                password_hash=hashed_password,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                is_active=True
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            logger.info(f"New user registered: {new_user.username} ({new_user.email})")
            return new_user
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error registering user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register user"
            )
    
    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> Optional[User]:
        """Authenticate user with email and password"""
        try:
            # Find user by email
            user = db.query(User).filter(User.email == login_data.email).first()
            
            if not user:
                return None
            
            # Check if user is active
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Account is deactivated"
                )
            
            # Verify password
            if not verify_password(login_data.password, user.password_hash):
                return None
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
            
            logger.info(f"User authenticated: {user.username}")
            return user
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    @staticmethod
    def create_user_tokens(user: User) -> dict:
        """Create access and refresh tokens for user"""
        try:
            # Create token data
            token_data = {
                "sub": user.user_id,
                "username": user.username,
                "email": user.email
            }
            
            # Create tokens
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
            
        except Exception as e:
            logger.error(f"Error creating tokens: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create authentication tokens"
            )
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            return db.query(User).filter(User.user_id == user_id).first()
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            return db.query(User).filter(User.email == email).first()
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    @staticmethod
    def update_user_profile(db: Session, user_id: str, update_data: dict) -> Optional[User]:
        """Update user profile"""
        try:
            user = db.query(User).filter(User.user_id == user_id).first()
            if not user:
                return None
            
            # Update fields
            for field, value in update_data.items():
                if hasattr(user, field) and value is not None:
                    setattr(user, field, value)
            
            db.commit()
            db.refresh(user)
            
            logger.info(f"User profile updated: {user.username}")
            return user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating user profile: {e}")
            return None
    
    @staticmethod
    def change_password(db: Session, user_id: str, current_password: str, new_password: str) -> bool:
        """Change user password"""
        try:
            user = db.query(User).filter(User.user_id == user_id).first()
            if not user:
                return False
            
            # Verify current password
            if not verify_password(current_password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is incorrect"
                )
            
            # Update password
            user.password_hash = get_password_hash(new_password)
            db.commit()
            
            logger.info(f"Password changed for user: {user.username}")
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error changing password: {e}")
            return False
