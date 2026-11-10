from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")

    database_url: str = "postgresql+asyncpg://bookstore:bookstore@localhost:5433/bookstore"
    jwt_secret: str = "change-me"
    access_token_ttl_min: int = 60
    refresh_token_ttl_days: int = 14
    media_root: str = "/data/media"
    max_upload_mb: int = 5
    cors_origins: str = "http://localhost:3000"
    bank_transfer_info: str = ""
    cookie_secure: bool = False  # set true behind HTTPS in production

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
