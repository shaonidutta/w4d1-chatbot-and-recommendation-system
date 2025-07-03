"""
Data importer service for fetching and processing mock data
"""
import requests
import json
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from loguru import logger

from app.core.config import settings
from app.db.models import Product, Category
from app.core.database import get_db


class DataImporter:
    """Service for importing mock product data"""
    
    def __init__(self):
        self.mock_data_url = settings.MOCK_DATA_URL
        self.raw_data: List[Dict] = []
        self.processed_data: List[Dict] = []
        self.categories: Dict[str, int] = {}
    
    async def fetch_mock_data(self) -> bool:
        """Fetch JSON data from the provided URL"""
        try:
            logger.info(f"Fetching mock data from: {self.mock_data_url}")
            response = requests.get(self.mock_data_url, timeout=30)
            response.raise_for_status()
            
            self.raw_data = response.json()
            logger.info(f"Successfully fetched {len(self.raw_data)} records")
            return True
            
        except requests.RequestException as e:
            logger.error(f"Failed to fetch mock data: {e}")
            return False
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON data: {e}")
            return False
    
    def analyze_data_structure(self) -> Dict[str, Any]:
        """Analyze the structure of the fetched data"""
        if not self.raw_data:
            return {"error": "No data to analyze"}
        
        sample_record = self.raw_data[0] if self.raw_data else {}
        
        analysis = {
            "total_records": len(self.raw_data),
            "sample_record": sample_record,
            "fields": list(sample_record.keys()) if sample_record else [],
            "field_types": {},
            "missing_values": {},
            "unique_categories": set()
        }
        
        # Analyze field types and missing values
        for field in analysis["fields"]:
            field_values = [record.get(field) for record in self.raw_data]
            non_null_values = [v for v in field_values if v is not None]
            
            analysis["field_types"][field] = type(non_null_values[0]).__name__ if non_null_values else "unknown"
            analysis["missing_values"][field] = len(field_values) - len(non_null_values)
            
            # Collect categories if this looks like a category field
            if "category" in field.lower() and non_null_values:
                analysis["unique_categories"].update(non_null_values)
        
        analysis["unique_categories"] = list(analysis["unique_categories"])
        logger.info(f"Data analysis complete: {analysis['total_records']} records, {len(analysis['fields'])} fields")
        
        return analysis
    
    def clean_and_transform_data(self) -> List[Dict]:
        """Clean and transform raw data for database insertion"""
        if not self.raw_data:
            logger.warning("No raw data to process")
            return []
        
        processed_products = []
        
        for record in self.raw_data:
            try:
                # Map and clean the product data
                product = self._clean_product_record(record)
                if product:
                    processed_products.append(product)
            except Exception as e:
                logger.warning(f"Failed to process record: {e}")
                continue
        
        self.processed_data = processed_products
        logger.info(f"Successfully processed {len(processed_products)} products")
        return processed_products
    
    def _clean_product_record(self, record: Dict) -> Optional[Dict]:
        """Clean and standardize a single product record"""
        # This method will be customized based on the actual data structure
        # For now, creating a generic mapping
        
        cleaned = {}
        
        # Map common fields (adjust based on actual data structure)
        field_mapping = {
            'name': ['name', 'title', 'product_name', 'item_name'],
            'price': ['price', 'cost', 'amount', 'value'],
            'description': ['description', 'desc', 'details', 'summary'],
            'category': ['category', 'type', 'genre', 'classification'],
            'brand': ['brand', 'manufacturer', 'company'],
            'rating': ['rating', 'score', 'stars'],
            'image_url': ['image', 'image_url', 'picture', 'photo']
        }
        
        for target_field, possible_sources in field_mapping.items():
            value = None
            for source_field in possible_sources:
                if source_field in record and record[source_field] is not None:
                    value = record[source_field]
                    break
            
            if value is not None:
                cleaned[target_field] = self._clean_field_value(target_field, value)
        
        # Ensure required fields
        if not cleaned.get('name'):
            return None
        
        # Set defaults for missing fields
        cleaned.setdefault('price', 0.0)
        cleaned.setdefault('description', '')
        cleaned.setdefault('category', 'Uncategorized')
        cleaned.setdefault('rating', 0.0)
        cleaned.setdefault('stock_quantity', 100)
        cleaned.setdefault('is_active', True)
        
        return cleaned
    
    def _clean_field_value(self, field_name: str, value: Any) -> Any:
        """Clean and validate individual field values"""
        if value is None:
            return None
        
        if field_name == 'price':
            # Extract numeric value from price strings
            if isinstance(value, str):
                # Remove currency symbols and extract numbers
                price_match = re.search(r'[\d,]+\.?\d*', str(value).replace(',', ''))
                return float(price_match.group()) if price_match else 0.0
            return float(value) if value else 0.0
        
        elif field_name == 'rating':
            # Normalize rating to 0-5 scale
            rating = float(value) if value else 0.0
            return min(max(rating, 0.0), 5.0)
        
        elif field_name in ['name', 'description', 'category', 'brand']:
            # Clean text fields
            return str(value).strip() if value else ''
        
        elif field_name == 'image_url':
            # Validate URL format
            url = str(value).strip() if value else ''
            if url and not url.startswith(('http://', 'https://')):
                return f"https://{url}"
            return url
        
        return value
    
    def extract_categories(self) -> List[str]:
        """Extract unique categories from processed data"""
        categories = set()
        
        for product in self.processed_data:
            category = product.get('category', '').strip()
            if category:
                categories.add(category)
        
        unique_categories = list(categories)
        logger.info(f"Extracted {len(unique_categories)} unique categories")
        return unique_categories
    
    def generate_feature_vectors(self, product: Dict) -> Dict[str, Any]:
        """Generate feature vectors for content-based filtering"""
        features = {}
        
        # Text features from description
        description = product.get('description', '').lower()
        keywords = re.findall(r'\b\w+\b', description)
        features['keywords'] = list(set(keywords))
        
        # Price range features
        price = float(product.get('price', 0))
        if price < 50:
            features['price_range'] = 'budget'
        elif price < 200:
            features['price_range'] = 'mid_range'
        else:
            features['price_range'] = 'premium'
        
        # Category features
        features['category'] = product.get('category', '').lower()
        features['brand'] = product.get('brand', '').lower()
        
        # Rating features
        rating = float(product.get('rating', 0))
        if rating >= 4.0:
            features['rating_tier'] = 'high'
        elif rating >= 3.0:
            features['rating_tier'] = 'medium'
        else:
            features['rating_tier'] = 'low'
        
        return features
    
    async def save_to_database(self, db: Session) -> bool:
        """Save processed data to database"""
        try:
            # First, create categories
            await self._create_categories(db)
            
            # Then create products
            await self._create_products(db)
            
            db.commit()
            logger.info("Successfully saved data to database")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save data to database: {e}")
            return False
    
    async def _create_categories(self, db: Session):
        """Create category records"""
        categories = self.extract_categories()
        
        for category_name in categories:
            # Check if category already exists
            existing = db.query(Category).filter(Category.category_name == category_name).first()
            if not existing:
                category = Category(
                    category_name=category_name,
                    description=f"Products in {category_name} category"
                )
                db.add(category)
                db.flush()  # Get the ID
                self.categories[category_name] = category.category_id
            else:
                self.categories[category_name] = existing.category_id
    
    async def _create_products(self, db: Session):
        """Create product records"""
        for product_data in self.processed_data:
            category_name = product_data.get('category', 'Uncategorized')
            category_id = self.categories.get(category_name)
            
            product = Product(
                name=product_data['name'],
                category_id=category_id,
                price=product_data['price'],
                description=product_data['description'],
                brand=product_data.get('brand'),
                rating=product_data.get('rating', 0.0),
                image_url=product_data.get('image_url'),
                stock_quantity=product_data.get('stock_quantity', 100),
                is_active=product_data.get('is_active', True)
            )
            db.add(product)
