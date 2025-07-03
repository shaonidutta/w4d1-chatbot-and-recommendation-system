"""
Script to rebuild the recommendation model
"""
import sys
import os
import asyncio

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.recommendation_service import recommendation_service
from loguru import logger


async def rebuild_model():
    """Rebuild the recommendation model"""
    try:
        logger.info("🤖 Starting recommendation model rebuild...")
        
        success = recommendation_service.rebuild_recommendations()
        
        if success:
            logger.info("✅ Recommendation model rebuilt successfully!")
            logger.info("🎯 The system is now ready for personalized recommendations!")
        else:
            logger.error("❌ Failed to rebuild recommendation model")
            
        return success
        
    except Exception as e:
        logger.error(f"❌ Error rebuilding model: {e}")
        return False


if __name__ == "__main__":
    asyncio.run(rebuild_model())
