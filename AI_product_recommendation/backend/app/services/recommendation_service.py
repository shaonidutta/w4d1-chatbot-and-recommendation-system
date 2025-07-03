"""
Content-based recommendation service using TF-IDF and cosine similarity
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import re
from loguru import logger

from app.db.models import Product, ProductSimilarity, UserView, UserLike, UserPurchase
from app.core.database import SessionLocal


class RecommendationService:
    """Service for content-based product recommendations"""
    
    def __init__(self):
        self.tfidf_vectorizer = None
        self.feature_matrix = None
        self.product_features = None
        self.similarity_matrix = None
        self.product_ids = []
        
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for TF-IDF"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def extract_product_features(self, db: Session) -> pd.DataFrame:
        """Extract and combine product features for recommendation"""
        try:
            # Get all active products
            products = db.query(Product).filter(Product.is_active == True).all()
            
            if not products:
                logger.warning("No active products found")
                return pd.DataFrame()
            
            # Create feature dataframe
            product_data = []
            for product in products:
                # Combine text features
                text_features = f"{product.name} {product.description or ''} {product.brand or ''}"
                text_features = self.preprocess_text(text_features)
                
                # Get category name
                category_name = product.category.category_name if product.category else "Unknown"
                
                product_data.append({
                    'product_id': product.product_id,
                    'name': product.name,
                    'text_features': text_features,
                    'category': category_name,
                    'price': float(product.price),
                    'rating': float(product.rating or 0),
                    'brand': product.brand or "Unknown"
                })
            
            df = pd.DataFrame(product_data)
            logger.info(f"Extracted features for {len(df)} products")
            return df
            
        except Exception as e:
            logger.error(f"Error extracting product features: {e}")
            return pd.DataFrame()
    
    def build_similarity_matrix(self, db: Session) -> bool:
        """Build TF-IDF vectors and calculate cosine similarity"""
        try:
            # Extract product features
            self.product_features = self.extract_product_features(db)
            
            if self.product_features.empty:
                logger.error("No product features available")
                return False
            
            # Initialize TF-IDF vectorizer
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=5000,
                stop_words='english',
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.8
            )
            
            # Create TF-IDF matrix from text features
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(
                self.product_features['text_features']
            )
            
            # Normalize numerical features
            scaler = StandardScaler()
            numerical_features = self.product_features[['price', 'rating']].fillna(0)
            numerical_features_scaled = scaler.fit_transform(numerical_features)
            
            # Combine TF-IDF and numerical features
            # Weight text features more heavily (80%) vs numerical (20%)
            text_weight = 0.8
            numerical_weight = 0.2
            
            # Convert sparse matrix to dense for combination
            tfidf_dense = tfidf_matrix.toarray()
            
            # Combine features
            combined_features = np.hstack([
                tfidf_dense * text_weight,
                numerical_features_scaled * numerical_weight
            ])
            
            # Calculate cosine similarity
            self.similarity_matrix = cosine_similarity(combined_features)
            self.product_ids = self.product_features['product_id'].tolist()
            
            logger.info(f"Built similarity matrix: {self.similarity_matrix.shape}")
            return True
            
        except Exception as e:
            logger.error(f"Error building similarity matrix: {e}")
            return False
    
    def store_similarities_in_db(self, db: Session, threshold: float = 0.1) -> bool:
        """Store product similarities in database"""
        try:
            if self.similarity_matrix is None or not self.product_ids:
                logger.error("Similarity matrix not built")
                return False
            
            # Clear existing similarities
            db.query(ProductSimilarity).delete()
            
            similarities_to_insert = []
            
            # Store similarities above threshold
            for i, product_id_1 in enumerate(self.product_ids):
                for j, product_id_2 in enumerate(self.product_ids):
                    if i < j:  # Avoid duplicates and self-similarity
                        similarity_score = float(self.similarity_matrix[i][j])
                        
                        if similarity_score >= threshold:
                            similarity = ProductSimilarity(
                                product_id_1=product_id_1,
                                product_id_2=product_id_2,
                                similarity_score=similarity_score,
                                algorithm_type='content_based'
                            )
                            similarities_to_insert.append(similarity)
            
            # Batch insert
            if similarities_to_insert:
                db.add_all(similarities_to_insert)
                db.commit()
                
                logger.info(f"Stored {len(similarities_to_insert)} product similarities")
                return True
            else:
                logger.warning("No similarities above threshold found")
                return False
                
        except Exception as e:
            db.rollback()
            logger.error(f"Error storing similarities: {e}")
            return False
    
    def get_similar_products(
        self, 
        db: Session, 
        product_id: str, 
        limit: int = 10
    ) -> List[Dict]:
        """Get similar products for a given product"""
        try:
            # Get similarities from database
            similarities = db.query(ProductSimilarity).filter(
                (ProductSimilarity.product_id_1 == product_id) |
                (ProductSimilarity.product_id_2 == product_id)
            ).order_by(ProductSimilarity.similarity_score.desc()).limit(limit).all()
            
            similar_product_ids = []
            for sim in similarities:
                other_id = sim.product_id_2 if sim.product_id_1 == product_id else sim.product_id_1
                similar_product_ids.append({
                    'product_id': other_id,
                    'similarity_score': float(sim.similarity_score)
                })
            
            return similar_product_ids
            
        except Exception as e:
            logger.error(f"Error getting similar products: {e}")
            return []
    
    def get_user_recommendations(
        self, 
        db: Session, 
        user_id: str, 
        limit: int = 20
    ) -> List[Dict]:
        """Get personalized recommendations based on user interactions"""
        try:
            # Get user's liked products
            liked_products = db.query(UserLike).filter(
                UserLike.user_id == user_id,
                UserLike.is_active == True
            ).all()
            
            # Get user's viewed products (recent ones)
            viewed_products = db.query(UserView).filter(
                UserView.user_id == user_id
            ).order_by(UserView.viewed_at.desc()).limit(50).all()
            
            # Get user's purchased products
            purchased_products = db.query(UserPurchase).filter(
                UserPurchase.user_id == user_id
            ).all()
            
            # Combine interaction data with weights
            interaction_scores = {}
            
            # Liked products (highest weight)
            for like in liked_products:
                interaction_scores[like.product_id] = interaction_scores.get(like.product_id, 0) + 3.0
            
            # Purchased products (high weight)
            for purchase in purchased_products:
                interaction_scores[purchase.product_id] = interaction_scores.get(purchase.product_id, 0) + 2.5
            
            # Viewed products (lower weight, recent views weighted more)
            for i, view in enumerate(viewed_products):
                weight = 1.0 - (i * 0.02)  # Decay weight for older views
                interaction_scores[view.product_id] = interaction_scores.get(view.product_id, 0) + weight
            
            # Get similar products for each interacted product
            recommendations = {}
            
            for product_id, score in interaction_scores.items():
                similar_products = self.get_similar_products(db, product_id, limit=20)
                
                for similar in similar_products:
                    sim_product_id = similar['product_id']
                    sim_score = similar['similarity_score']
                    
                    # Skip if user already interacted with this product
                    if sim_product_id in interaction_scores:
                        continue
                    
                    # Calculate recommendation score
                    rec_score = score * sim_score
                    
                    if sim_product_id in recommendations:
                        recommendations[sim_product_id] += rec_score
                    else:
                        recommendations[sim_product_id] = rec_score
            
            # Sort by recommendation score and return top products
            sorted_recommendations = sorted(
                recommendations.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:limit]
            
            result = []
            for product_id, score in sorted_recommendations:
                result.append({
                    'product_id': product_id,
                    'recommendation_score': float(score)
                })
            
            logger.info(f"Generated {len(result)} recommendations for user {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error getting user recommendations: {e}")
            return []
    
    def rebuild_recommendations(self) -> bool:
        """Rebuild the entire recommendation system"""
        try:
            db = SessionLocal()
            
            logger.info("Starting recommendation system rebuild...")
            
            # Build similarity matrix
            if not self.build_similarity_matrix(db):
                return False
            
            # Store similarities in database
            if not self.store_similarities_in_db(db):
                return False
            
            logger.info("Recommendation system rebuild completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error rebuilding recommendations: {e}")
            return False
        finally:
            db.close()


# Global instance
recommendation_service = RecommendationService()
