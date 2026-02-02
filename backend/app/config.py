import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")

settings = Settings()