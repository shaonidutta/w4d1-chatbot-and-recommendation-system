"""
Quick User Seeding Script - Creates 3 test users for immediate testing
"""
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.db.models import User
from app.core.security import get_password_hash
from loguru import logger


def create_test_users():
    """Create 3 quick test users"""
    db = SessionLocal()
    
    test_users = [
        {
            "username": "testuser1",
            "email": "test1@example.com",
            "password": "password123",
            "first_name": "Alice",
            "last_name": "Test"
        },
        {
            "username": "testuser2", 
            "email": "test2@example.com",
            "password": "password123",
            "first_name": "Bob",
            "last_name": "Test"
        },
        {
            "username": "admin",
            "email": "admin@example.com", 
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User"
        }
    ]
    
    try:
        created_count = 0
        
        for user_data in test_users:
            # Check if user exists
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing:
                logger.info(f"User {user_data['email']} already exists")
                continue
            
            # Create user
            new_user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                is_active=True
            )
            
            db.add(new_user)
            created_count += 1
            logger.info(f"Created user: {user_data['email']}")
        
        db.commit()
        
        logger.info("\n" + "="*50)
        logger.info("🎉 QUICK TEST USERS CREATED")
        logger.info("="*50)
        
        for user_data in test_users:
            logger.info(f"📧 Email: {user_data['email']}")
            logger.info(f"🔑 Password: {user_data['password']}")
            logger.info("-" * 30)
        
        logger.info("✅ You can now test login with these accounts!")
        logger.info("="*50)
        
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creating users: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    create_test_users()
