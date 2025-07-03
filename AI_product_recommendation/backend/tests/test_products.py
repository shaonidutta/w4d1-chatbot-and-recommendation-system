"""
Tests for product management and recommendations
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.db.models import User, Product, Category, UserView, UserLike
from app.core.security import get_password_hash

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_products.db"
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


@pytest.fixture
def test_category():
    db = TestingSessionLocal()
    category = Category(
        category_name="Test Category",
        description="Test category description"
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    yield category
    db.delete(category)
    db.commit()
    db.close()


@pytest.fixture
def test_products(test_category):
    db = TestingSessionLocal()
    products = []
    
    for i in range(5):
        product = Product(
            name=f"Test Product {i+1}",
            category_id=test_category.category_id,
            price=10.99 + i,
            description=f"Description for test product {i+1}",
            brand="Test Brand",
            rating=4.0 + (i * 0.2),
            stock_quantity=100,
            is_active=True
        )
        db.add(product)
        products.append(product)
    
    db.commit()
    for product in products:
        db.refresh(product)
    
    yield products
    
    for product in products:
        db.delete(product)
    db.commit()
    db.close()


def get_auth_token(test_user):
    """Helper function to get authentication token"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    return response.json()["access_token"]


class TestProductEndpoints:
    """Test product management endpoints"""
    
    def test_get_products(self, setup_database, test_products):
        """Test getting products with pagination"""
        response = client.get("/api/v1/products/")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert len(data["products"]) <= data["per_page"]
    
    def test_get_products_with_pagination(self, setup_database, test_products):
        """Test product pagination"""
        response = client.get("/api/v1/products/?page=1&per_page=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) <= 2
        assert data["page"] == 1
        assert data["per_page"] == 2
    
    def test_get_product_by_id(self, setup_database, test_products):
        """Test getting single product by ID"""
        product_id = test_products[0].product_id
        response = client.get(f"/api/v1/products/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["product_id"] == product_id
        assert data["name"] == "Test Product 1"
    
    def test_get_nonexistent_product(self, setup_database):
        """Test getting non-existent product"""
        response = client.get("/api/v1/products/nonexistent-id")
        assert response.status_code == 404
    
    def test_search_products(self, setup_database, test_products):
        """Test product search"""
        response = client.get("/api/v1/products/search?query=Test Product")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert len(data["products"]) > 0
    
    def test_search_products_with_filters(self, setup_database, test_products):
        """Test product search with filters"""
        response = client.get(
            "/api/v1/products/search?min_price=11&max_price=13&min_rating=4.2"
        )
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        # Verify filtering works
        for product in data["products"]:
            assert product["price"] >= 11
            assert product["price"] <= 13
            assert product["rating"] >= 4.2
    
    def test_get_categories(self, setup_database, test_category):
        """Test getting all categories"""
        response = client.get("/api/v1/products/categories")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        assert any(cat["category_name"] == "Test Category" for cat in data)
    
    def test_get_products_by_category(self, setup_database, test_products, test_category):
        """Test getting products by category"""
        response = client.get(f"/api/v1/products/category/{test_category.category_id}")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert len(data["products"]) == 5  # All test products are in this category
    
    def test_track_product_view(self, setup_database, test_products, test_user):
        """Test tracking product view"""
        token = get_auth_token(test_user)
        product_id = test_products[0].product_id
        
        response = client.post(
            f"/api/v1/products/{product_id}/view",
            headers={"Authorization": f"Bearer {token}"},
            json={"duration_seconds": 30}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "View tracked successfully"
        assert data["product_id"] == product_id
    
    def test_toggle_product_like(self, setup_database, test_products, test_user):
        """Test liking/unliking a product"""
        token = get_auth_token(test_user)
        product_id = test_products[0].product_id
        
        # Like the product
        response = client.post(
            f"/api/v1/products/{product_id}/like",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_liked"] == True
        assert data["total_likes"] >= 1
        
        # Unlike the product
        response = client.post(
            f"/api/v1/products/{product_id}/like",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_liked"] == False
    
    def test_get_trending_products(self, setup_database, test_products):
        """Test getting trending products"""
        response = client.get("/api/v1/products/trending?limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3


class TestRecommendationEndpoints:
    """Test recommendation endpoints"""
    
    def test_get_similar_products(self, setup_database, test_products):
        """Test getting similar products"""
        product_id = test_products[0].product_id
        response = client.get(f"/api/v1/recommendations/similar/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_similar_products_nonexistent(self, setup_database):
        """Test getting similar products for non-existent product"""
        response = client.get("/api/v1/recommendations/similar/nonexistent-id")
        assert response.status_code == 404
    
    def test_get_user_recommendations(self, setup_database, test_products, test_user):
        """Test getting personalized recommendations"""
        token = get_auth_token(test_user)
        
        # First, create some user interactions
        product_id = test_products[0].product_id
        client.post(
            f"/api/v1/products/{product_id}/like",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Get recommendations
        response = client.get(
            "/api/v1/recommendations/user/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_trending_recommendations(self, setup_database, test_products):
        """Test getting trending product recommendations"""
        response = client.get("/api/v1/recommendations/trending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_rebuild_recommendations(self, setup_database, test_user):
        """Test rebuilding recommendation model"""
        token = get_auth_token(test_user)
        
        response = client.post(
            "/api/v1/recommendations/rebuild",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "status" in data


if __name__ == "__main__":
    pytest.main([__file__])
