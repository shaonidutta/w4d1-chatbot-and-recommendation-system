"""
User management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import UserResponse, UserUpdate, PasswordChange
from app.services.auth_service import AuthService
from app.api.dependencies import get_current_user
from app.db.models import User

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return UserResponse.from_orm(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    try:
        # Update user profile
        updated_user = AuthService.update_user_profile(
            db,
            current_user.user_id,
            user_update.dict(exclude_unset=True)
        )

        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse.from_orm(updated_user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        success = AuthService.change_password(
            db,
            current_user.user_id,
            password_data.current_password,
            password_data.new_password
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to change password"
            )

        return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


@router.get("/me/preferences")
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user preferences and interaction history"""
    try:
        # Get user's liked products count
        liked_count = len(current_user.likes) if current_user.likes else 0

        # Get user's viewed products count
        viewed_count = len(current_user.views) if current_user.views else 0

        # Get user's purchase count
        purchase_count = len(current_user.purchases) if current_user.purchases else 0

        return {
            "user_id": current_user.user_id,
            "username": current_user.username,
            "interaction_stats": {
                "liked_products": liked_count,
                "viewed_products": viewed_count,
                "purchases": purchase_count
            },
            "account_created": current_user.created_at,
            "last_login": current_user.last_login
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user preferences"
        )
