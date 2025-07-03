"""
Tests for authentication system
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.db.models import User
from app.core.security import get_password_hash

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user():
    db = TestingSessionLocal()
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("testpassword"),
        first_name="Test",
        last_name="User",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.delete(user)
    db.commit()
    db.close()


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_user(self, setup_database):
        """Test user registration"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "newpassword123",
                "first_name": "New",
                "last_name": "User"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "password" not in data
    
    def test_register_duplicate_email(self, setup_database, test_user):
        """Test registration with duplicate email"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "anotheruser",
                "email": "test@example.com",  # Same as test_user
                "password": "password123",
                "first_name": "Another",
                "last_name": "User"
            }
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_login_success(self, setup_database, test_user):
        """Test successful login"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self, setup_database, test_user):
        """Test login with invalid credentials"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, setup_database):
        """Test login with non-existent user"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 401
    
    def test_get_current_user(self, setup_database, test_user):
        """Test getting current user info"""
        # First login to get token
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        # Get current user
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
    
    def test_logout(self, setup_database, test_user):
        """Test user logout"""
        # First login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        # Logout
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Logout successful"
    
    def test_protected_endpoint_without_token(self, setup_database):
        """Test accessing protected endpoint without token"""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401
    
    def test_protected_endpoint_invalid_token(self, setup_database):
        """Test accessing protected endpoint with invalid token"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401


class TestUserManagement:
    """Test user management endpoints"""
    
    def test_update_user_profile(self, setup_database, test_user):
        """Test updating user profile"""
        # Login first
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        # Update profile
        response = client.put(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "first_name": "Updated",
                "last_name": "Name"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "Name"
    
    def test_change_password(self, setup_database, test_user):
        """Test changing password"""
        # Login first
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        # Change password
        response = client.post(
            "/api/v1/users/me/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": "testpassword",
                "new_password": "newpassword123"
            }
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Password changed successfully"
        
        # Test login with new password
        new_login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "newpassword123"
            }
        )
        assert new_login_response.status_code == 200
    
    def test_change_password_wrong_current(self, setup_database, test_user):
        """Test changing password with wrong current password"""
        # Login first
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword"
            }
        )
        token = login_response.json()["access_token"]
        
        # Try to change password with wrong current password
        response = client.post(
            "/api/v1/users/me/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword123"
            }
        )
        assert response.status_code == 400
        assert "Current password is incorrect" in response.json()["detail"]


if __name__ == "__main__":
    pytest.main([__file__])
