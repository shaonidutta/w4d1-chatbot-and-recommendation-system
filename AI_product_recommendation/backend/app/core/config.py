"""
Application configuration settings
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """
    Application settings configuration
    """
    
    # Application
    APP_NAME: str = "AI Product Recommendation System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "ai_recommendation_db"
    DATABASE_URL: Optional[str] = None
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        return f"mysql+pymysql://{values.get('DB_USER')}:{values.get('DB_PASSWORD')}@{values.get('DB_HOST')}:{values.get('DB_PORT')}/{values.get('DB_NAME')}"
    
    # JWT Configuration
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    def get_allowed_origins(self) -> List[str]:
        """Get CORS allowed origins as list"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        return self.ALLOWED_ORIGINS
    
    # Mock Data
    MOCK_DATA_URL: str = "https://coding-platform.s3.amazonaws.com/dev/lms/tickets/5e1edafc-c15f-4276-ab27-611fb0a5cfb8/SL3IZLaDQwCLKWPC.json"
    
    # Recommendation Engine
    SIMILARITY_THRESHOLD: float = 0.1
    MAX_RECOMMENDATIONS: int = 10
    CACHE_EXPIRY_HOURS: int = 24
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
