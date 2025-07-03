"""
Script to import mock data into the database
"""
import asyncio
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.data_importer import DataImporter
from app.core.database import SessionLocal
from loguru import logger


async def main():
    """Main function to run data import"""
    logger.info("Starting data import process...")
    
    # Initialize the data importer
    importer = DataImporter()
    
    # Step 1: Fetch mock data
    logger.info("Step 1: Fetching mock data...")
    success = await importer.fetch_mock_data()
    if not success:
        logger.error("Failed to fetch mock data. Exiting.")
        return
    
    # Step 2: Analyze data structure
    logger.info("Step 2: Analyzing data structure...")
    analysis = importer.analyze_data_structure()
    logger.info(f"Data analysis results: {analysis}")
    
    # Step 3: Clean and transform data
    logger.info("Step 3: Cleaning and transforming data...")
    processed_data = importer.clean_and_transform_data()
    if not processed_data:
        logger.error("No data was processed successfully. Exiting.")
        return
    
    # Step 4: Extract categories
    logger.info("Step 4: Extracting categories...")
    categories = importer.extract_categories()
    logger.info(f"Found categories: {categories}")
    
    # Step 5: Save to database (when database is available)
    logger.info("Step 5: Database save (skipped - database not configured)")
    logger.info("To save to database:")
    logger.info("1. Configure MySQL connection in .env file")
    logger.info("2. Run: python scripts/create_database.py")
    logger.info("3. Run this script again")
    
    # For now, save processed data to JSON file for inspection
    import json
    output_file = "processed_products.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed_data[:10], f, indent=2, ensure_ascii=False)  # Save first 10 for inspection
    
    logger.info(f"✅ Data import process completed!")
    logger.info(f"📁 Sample processed data saved to: {output_file}")
    logger.info(f"📊 Total products processed: {len(processed_data)}")
    logger.info(f"📂 Total categories found: {len(categories)}")


if __name__ == "__main__":
    asyncio.run(main())
