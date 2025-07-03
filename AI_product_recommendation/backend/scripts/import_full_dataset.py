"""
Generate SQL script to import the full 1000 product dataset
"""
import sys
import os
import json

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.data_importer import DataImporter
from loguru import logger


async def generate_full_sql():
    """Generate SQL for importing all 1000 products"""
    try:
        # Initialize importer and fetch data
        importer = DataImporter()
        
        logger.info("Fetching full dataset...")
        success = await importer.fetch_mock_data()
        if not success:
            logger.error("Failed to fetch data")
            return False
        
        logger.info("Processing data...")
        processed_data = importer.clean_and_transform_data()
        categories = importer.extract_categories()
        
        logger.info(f"Processing {len(processed_data)} products and {len(categories)} categories")
        
        # Generate comprehensive SQL file
        sql_file = "import_full_dataset.sql"
        
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- AI Product Recommendation System - Full Dataset Import\n")
            f.write("-- This script imports all 1000 products and 121 categories\n")
            f.write("USE ai_recommendation_db;\n\n")
            
            # Insert categories
            f.write("-- Insert all categories\n")
            for category in sorted(categories):
                category_escaped = category.replace("'", "''")
                f.write(f"INSERT IGNORE INTO categories (category_name, description) VALUES ('{category_escaped}', 'Products in {category_escaped} category');\n")
            
            f.write(f"\n-- Insert all {len(processed_data)} products\n")
            
            # Insert products in batches of 50 for better readability
            batch_size = 50
            for i in range(0, len(processed_data), batch_size):
                batch = processed_data[i:i + batch_size]
                batch_num = (i // batch_size) + 1
                
                f.write(f"\n-- Batch {batch_num}: Products {i+1} to {min(i+batch_size, len(processed_data))}\n")
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
                f.write(";\n")
        
        logger.info(f"✅ Generated comprehensive SQL import file: {sql_file}")
        logger.info(f"📊 Contains {len(categories)} categories and {len(processed_data)} products")
        
        # Also save the processed data as JSON for backup
        with open("full_processed_products.json", 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, indent=2, ensure_ascii=False)
        
        logger.info("📁 Also saved full processed data as: full_processed_products.json")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error generating SQL: {e}")
        return False


if __name__ == "__main__":
    import asyncio
    asyncio.run(generate_full_sql())
