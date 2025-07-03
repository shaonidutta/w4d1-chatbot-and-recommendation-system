"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import UserRegistration, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import AuthService
from app.api.dependencies import get_current_user
from app.db.models import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegistration,
    db: Session = Depends(get_db)
):
    """User registration endpoint"""
    try:
        # Register new user
        new_user = AuthService.register_user(db, user_data)

        # Return user data (without password)
        return UserResponse.from_orm(new_user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=dict)
async def login(
    login_data: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    """User login endpoint"""
    try:
        # Authenticate user
        user = AuthService.authenticate_user(db, login_data)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create tokens
        tokens = AuthService.create_user_tokens(user)

        # Set HTTP-only cookie for access token
        response.set_cookie(
            key="access_token",
            value=tokens["access_token"],
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=1800  # 30 minutes
        )

        # Set HTTP-only cookie for refresh token
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=604800  # 7 days
        )

        return {
            "message": "Login successful",
            "user": UserResponse.from_orm(user),
            "access_token": tokens["access_token"],  # Also return in response for API clients
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user)
):
    """User logout endpoint"""
    try:
        # Clear cookies
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token")

        return {"message": "Logout successful"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Refresh JWT token endpoint"""
    try:
        # Get refresh token from cookie
        refresh_token = request.cookies.get("refresh_token")

        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found"
            )

        # Verify refresh token
        from app.core.security import verify_token
        payload = verify_token(refresh_token)
        user_id = payload.get("sub")

        if not user_id or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Get user
        user = AuthService.get_user_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        # Create new tokens
        tokens = AuthService.create_user_tokens(user)

        # Set new cookies
        response.set_cookie(
            key="access_token",
            value=tokens["access_token"],
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=1800
        )

        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=604800
        )

        return {
            "message": "Token refreshed successfully",
            "access_token": tokens["access_token"],
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return UserResponse.from_orm(current_user)
