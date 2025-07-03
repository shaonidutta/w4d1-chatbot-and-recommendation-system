"""
User Seeding Script for AI Product Recommendation System
Creates test users with sample interactions for testing the hybrid filtering system
"""
import sys
import os
import asyncio
import random
from datetime import datetime, timedelta

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.db.models import User, Product, UserView, UserLike, UserPurchase
from app.core.security import get_password_hash
from loguru import logger


class UserSeeder:
    """Class for seeding users and their interactions"""
    
    def __init__(self):
        self.db = SessionLocal()
        self.sample_users = [
            {
                "username": "alice_fashion",
                "email": "alice@example.com",
                "password": "password123",
                "first_name": "Alice",
                "last_name": "Johnson",
                "preferences": ["fashion", "beauty", "accessories"]
            },
            {
                "username": "bella_beauty",
                "email": "bella@example.com", 
                "password": "password123",
                "first_name": "Bella",
                "last_name": "Smith",
                "preferences": ["beauty", "skincare", "makeup"]
            },
            {
                "username": "chloe_tech",
                "email": "chloe@example.com",
                "password": "password123", 
                "first_name": "Chloe",
                "last_name": "Davis",
                "preferences": ["electronics", "gadgets", "tech"]
            },
            {
                "username": "diana_home",
                "email": "diana@example.com",
                "password": "password123",
                "first_name": "Diana",
                "last_name": "Wilson",
                "preferences": ["home", "decor", "kitchen"]
            },
            {
                "username": "emma_books",
                "email": "emma@example.com",
                "password": "password123",
                "first_name": "Emma",
                "last_name": "Brown",
                "preferences": ["books", "education", "stationery"]
            },
            {
                "username": "fiona_fitness",
                "email": "fiona@example.com",
                "password": "password123",
                "first_name": "Fiona",
                "last_name": "Taylor",
                "preferences": ["sports", "fitness", "health"]
            },
            {
                "username": "grace_gourmet",
                "email": "grace@example.com",
                "password": "password123",
                "first_name": "Grace",
                "last_name": "Anderson",
                "preferences": ["food", "gourmet", "cooking"]
            },
            {
                "username": "hannah_hobbies",
                "email": "hannah@example.com",
                "password": "password123",
                "first_name": "Hannah",
                "last_name": "Martinez",
                "preferences": ["hobbies", "crafts", "art"]
            },
            {
                "username": "ivy_outdoor",
                "email": "ivy@example.com",
                "password": "password123",
                "first_name": "Ivy",
                "last_name": "Garcia",
                "preferences": ["outdoor", "camping", "adventure"]
            },
            {
                "username": "jade_jewelry",
                "email": "jade@example.com",
                "password": "password123",
                "first_name": "Jade",
                "last_name": "Rodriguez",
                "preferences": ["jewelry", "accessories", "luxury"]
            }
        ]
    
    def create_users(self):
        """Create sample users"""
        try:
            logger.info("Creating sample users...")
            created_users = []
            
            for user_data in self.sample_users:
                # Check if user already exists
                existing_user = self.db.query(User).filter(
                    User.email == user_data["email"]
                ).first()
                
                if existing_user:
                    logger.info(f"User {user_data['email']} already exists, skipping...")
                    created_users.append(existing_user)
                    continue
                
                # Create new user
                new_user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=get_password_hash(user_data["password"]),
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    is_active=True
                )
                
                self.db.add(new_user)
                created_users.append(new_user)
                logger.info(f"Created user: {user_data['email']}")
            
            self.db.commit()
            logger.info(f"✅ Successfully created {len(created_users)} users")
            return created_users
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"❌ Error creating users: {e}")
            return []
    
    def create_user_interactions(self, users):
        """Create realistic user interactions for testing recommendations"""
        try:
            logger.info("Creating user interactions...")
            
            # Get all products
            products = self.db.query(Product).filter(Product.is_active == True).all()
            if not products:
                logger.error("No products found! Please import products first.")
                return False
            
            interactions_created = 0
            
            for i, user in enumerate(users):
                user_preferences = self.sample_users[i]["preferences"]
                
                # Create views (each user views 15-30 products)
                view_count = random.randint(15, 30)
                viewed_products = random.sample(products, min(view_count, len(products)))
                
                for product in viewed_products:
                    # Higher chance to view products matching user preferences
                    preference_match = any(pref.lower() in product.name.lower() or 
                                         pref.lower() in (product.description or "").lower() or
                                         pref.lower() in (product.brand or "").lower()
                                         for pref in user_preferences)
                    
                    if preference_match or random.random() < 0.3:  # 30% chance for non-matching
                        view_duration = random.randint(5, 120)  # 5 seconds to 2 minutes
                        view_time = datetime.utcnow() - timedelta(
                            days=random.randint(1, 30),
                            hours=random.randint(0, 23),
                            minutes=random.randint(0, 59)
                        )
                        
                        view = UserView(
                            user_id=user.user_id,
                            product_id=product.product_id,
                            duration_seconds=view_duration,
                            viewed_at=view_time
                        )
                        self.db.add(view)
                        interactions_created += 1
                
                # Create likes (each user likes 5-15 products)
                like_count = random.randint(5, 15)
                liked_products = random.sample(viewed_products, min(like_count, len(viewed_products)))
                
                for product in liked_products:
                    # Higher chance to like products matching preferences
                    preference_match = any(pref.lower() in product.name.lower() or 
                                         pref.lower() in (product.description or "").lower() or
                                         pref.lower() in (product.brand or "").lower()
                                         for pref in user_preferences)
                    
                    if preference_match or random.random() < 0.2:  # 20% chance for non-matching
                        like_time = datetime.utcnow() - timedelta(
                            days=random.randint(1, 25),
                            hours=random.randint(0, 23)
                        )
                        
                        like = UserLike(
                            user_id=user.user_id,
                            product_id=product.product_id,
                            is_active=True,
                            liked_at=like_time
                        )
                        self.db.add(like)
                        interactions_created += 1
                
                # Create purchases (each user purchases 1-5 products)
                purchase_count = random.randint(1, 5)
                purchased_products = random.sample(liked_products, min(purchase_count, len(liked_products)))
                
                for product in purchased_products:
                    quantity = random.randint(1, 3)
                    unit_price = float(product.price)
                    total_price = unit_price * quantity
                    
                    purchase_time = datetime.utcnow() - timedelta(
                        days=random.randint(1, 20),
                        hours=random.randint(0, 23)
                    )
                    
                    purchase = UserPurchase(
                        user_id=user.user_id,
                        product_id=product.product_id,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=total_price,
                        purchased_at=purchase_time
                    )
                    self.db.add(purchase)
                    interactions_created += 1
                
                logger.info(f"Created interactions for user: {user.email}")
            
            self.db.commit()
            logger.info(f"✅ Successfully created {interactions_created} user interactions")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"❌ Error creating user interactions: {e}")
            return False
    
    def print_user_summary(self, users):
        """Print summary of created users"""
        logger.info("\n" + "="*60)
        logger.info("👥 USER ACCOUNTS CREATED")
        logger.info("="*60)
        
        for i, user in enumerate(users):
            user_data = self.sample_users[i]
            logger.info(f"📧 Email: {user_data['email']}")
            logger.info(f"🔑 Password: {user_data['password']}")
            logger.info(f"👤 Name: {user_data['first_name']} {user_data['last_name']}")
            logger.info(f"💖 Preferences: {', '.join(user_data['preferences'])}")
            logger.info("-" * 40)
        
        logger.info("🎯 Use these accounts to test:")
        logger.info("   • User authentication")
        logger.info("   • Personalized recommendations")
        logger.info("   • Hybrid filtering system")
        logger.info("   • User interaction tracking")
        logger.info("="*60)
    
    def run_seeding(self):
        """Run the complete seeding process"""
        try:
            logger.info("🌱 Starting user seeding process...")
            
            # Create users
            users = self.create_users()
            if not users:
                logger.error("Failed to create users")
                return False
            
            # Create interactions
            success = self.create_user_interactions(users)
            if not success:
                logger.error("Failed to create user interactions")
                return False
            
            # Print summary
            self.print_user_summary(users)
            
            logger.info("🎉 User seeding completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error in seeding process: {e}")
            return False
        finally:
            self.db.close()


async def main():
    """Main function"""
    seeder = UserSeeder()
    success = seeder.run_seeding()
    
    if success:
        logger.info("✅ All users and interactions created successfully!")
        logger.info("🚀 You can now test the recommendation system!")
    else:
        logger.error("❌ Seeding process failed!")


if __name__ == "__main__":
    asyncio.run(main())
