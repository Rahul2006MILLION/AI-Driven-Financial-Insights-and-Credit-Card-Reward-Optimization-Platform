from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    APP_SECRET_KEY: str = "cliq_super_secure_default_secret_key_change_in_production_32char"
    
    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR}/data/cliq.db"
    
    # Supabase (optional for cloud integration)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    
    # AI Providers
    AI_PROVIDER: str = "gemini"  # "gemini", "openai", "anthropic", "mock"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    AI_MODEL_NAME: str = "gemini-2.5-flash"
    GEMINI_MODEL: Optional[str] = None  # Configurable override for Google Gemini model

    @property
    def effective_ai_model(self) -> str:
        return self.GEMINI_MODEL or self.AI_MODEL_NAME
    
    # Security
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001"
    RATE_LIMIT_PER_MINUTE: int = 600
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    
    # Token Expiration
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Frontend URL (used in password reset links)
    FRONTEND_URL: str = "http://localhost:3000"

    # Email / SMTP (for password reset)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@cliq.ai"
    SMTP_FROM_NAME: str = "CLIQ"
    SMTP_TLS: bool = True
    PASSWORD_RESET_EXPIRE_MINUTES: int = 60  # 1 hour
    PASSWORD_RESET_RATE_LIMIT_PER_HOUR: int = 3  # max 3 requests per email per hour
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
