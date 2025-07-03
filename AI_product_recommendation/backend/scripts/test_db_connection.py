"""
Test database connection and import processed product data
"""
import sys
import os
import json
import asyncio

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, SessionLocal
from app.db.models import Product, Category
from sqlalchemy import text
from loguru import logger


def test_database_connection():
    """Test if database connection is working"""
    try:
        # Test basic connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful!")
            
            # Test if our database exists
            result = connection.execute(text("SELECT DATABASE()"))
            current_db = result.fetchone()[0]
            logger.info(f"📊 Connected to database: {current_db}")
            
            # Check if tables exist
            result = connection.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result.fetchall()]
            logger.info(f"📋 Available tables: {tables}")
            
            return True
            
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False


def import_processed_data():
    """Import the processed product data into database"""
    try:
        # Load processed data
        data_file = "processed_products.json"
        if not os.path.exists(data_file):
            logger.error(f"❌ Data file not found: {data_file}")
            logger.info("💡 Run 'python scripts/import_data.py' first to generate processed data")
            return False
        
        with open(data_file, 'r', encoding='utf-8') as f:
            sample_products = json.load(f)
        
        logger.info(f"📁 Loaded {len(sample_products)} sample products from {data_file}")
        
        # Get database session
        db = SessionLocal()
        
        try:
            # First, create categories from the sample data
            categories_created = set()
            for product in sample_products:
                category_name = product.get('category', 'Uncategorized')
                
                if category_name not in categories_created:
                    # Check if category already exists
                    existing_category = db.query(Category).filter(
                        Category.category_name == category_name
                    ).first()
                    
                    if not existing_category:
                        new_category = Category(
                            category_name=category_name,
                            description=f"Products in {category_name} category"
                        )
                        db.add(new_category)
                        logger.info(f"➕ Created category: {category_name}")
                    
                    categories_created.add(category_name)
            
            # Commit categories first
            db.commit()
            logger.info(f"✅ Created {len(categories_created)} categories")
            
            # Now create products
            products_created = 0
            for product_data in sample_products:
                # Get category ID
                category_name = product_data.get('category', 'Uncategorized')
                category = db.query(Category).filter(
                    Category.category_name == category_name
                ).first()
                
                # Check if product already exists (by name to avoid duplicates)
                existing_product = db.query(Product).filter(
                    Product.name == product_data['name']
                ).first()
                
                if not existing_product:
                    new_product = Product(
                        name=product_data['name'],
                        category_id=category.category_id if category else None,
                        price=float(product_data['price']),
                        description=product_data.get('description', ''),
                        brand=product_data.get('brand', ''),
                        rating=float(product_data.get('rating', 0.0)),
                        image_url=product_data.get('image_url', ''),
                        stock_quantity=int(product_data.get('stock_quantity', 100)),
                        is_active=product_data.get('is_active', True)
                    )
                    db.add(new_product)
                    products_created += 1
            
            # Commit products
            db.commit()
            logger.info(f"✅ Created {products_created} products")
            
            # Verify the import
            total_categories = db.query(Category).count()
            total_products = db.query(Product).count()
            
            logger.info(f"📊 Database summary:")
            logger.info(f"   - Total categories: {total_categories}")
            logger.info(f"   - Total products: {total_products}")
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Error importing data: {e}")
            return False
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Error in import process: {e}")
        return False


def generate_sql_import():
    """Generate SQL statements for importing all 1000 products"""
    try:
        # Load the full processed data
        data_file = "processed_products.json"
        if not os.path.exists(data_file):
            logger.error(f"❌ Data file not found: {data_file}")
            return False
        
        with open(data_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Also load the full dataset if available
        full_data_file = "full_processed_products.json"
        if os.path.exists(full_data_file):
            with open(full_data_file, 'r', encoding='utf-8') as f:
                products = json.load(f)
            logger.info(f"📁 Using full dataset: {len(products)} products")
        else:
            logger.info(f"📁 Using sample dataset: {len(products)} products")
        
        # Generate SQL file
        sql_file = "import_products.sql"
        
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- Import processed product data\n")
            f.write("USE ai_recommendation_db;\n\n")
            
            # Get unique categories
            categories = set()
            for product in products:
                categories.add(product.get('category', 'Uncategorized'))
            
            # Insert categories
            f.write("-- Insert categories\n")
            for category in sorted(categories):
                category_escaped = category.replace("'", "''")
                f.write(f"INSERT IGNORE INTO categories (category_name, description) VALUES ('{category_escaped}', 'Products in {category_escaped} category');\n")
            
            f.write("\n-- Insert products\n")
            
            # Insert products in batches
            batch_size = 100
            for i in range(0, len(products), batch_size):
                batch = products[i:i + batch_size]
                
                f.write("INSERT IGNORE INTO products (name, category_id, price, description, brand, rating, image_url, stock_quantity, is_active) VALUES\n")
                
                values = []
                for product in batch:
                    name = product['name'].replace("'", "''")
                    description = product.get('description', '').replace("'", "''")
                    brand = product.get('brand', '').replace("'", "''")
                    category = product.get('category', 'Uncategorized').replace("'", "''")
                    image_url = product.get('image_url', '').replace("'", "''")
                    
                    value = f"('{name}', (SELECT category_id FROM categories WHERE category_name = '{category}'), {product['price']}, '{description}', '{brand}', {product.get('rating', 0.0)}, '{image_url}', {product.get('stock_quantity', 100)}, {str(product.get('is_active', True)).lower()})"
                    values.append(value)
                
                f.write(",\n".join(values))
                f.write(";\n\n")
        
        logger.info(f"✅ Generated SQL import file: {sql_file}")
        logger.info(f"📊 Contains {len(categories)} categories and {len(products)} products")
        logger.info(f"💡 Run this file in MySQL to import all data")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error generating SQL: {e}")
        return False


async def main():
    """Main function"""
    logger.info("🚀 Starting database connection test and data import...")
    
    # Test database connection
    if not test_database_connection():
        logger.error("❌ Cannot proceed without database connection")
        return
    
    # Import sample data
    logger.info("\n📥 Importing sample data...")
    if import_processed_data():
        logger.info("✅ Sample data imported successfully!")
    
    # Generate SQL for full import
    logger.info("\n📝 Generating SQL for full data import...")
    if generate_sql_import():
        logger.info("✅ SQL import file generated!")
    
    logger.info("\n🎉 Process completed!")


if __name__ == "__main__":
    asyncio.run(main())
