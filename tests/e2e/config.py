"""Runtime configuration for Selenium end-to-end tests."""
from __future__ import annotations

import os
from dataclasses import dataclass


def _env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Required environment variable '{name}' is not set")
    return value


@dataclass(slots=True)
class Settings:
    """Configuration shared across tests."""

    base_url: str
    admin_url: str
    api_url: str
    remote_webdriver_url: str | None
    browser: str
    implicit_wait: float
    explicit_wait: float

    @classmethod
    def load(cls) -> "Settings":
        base_url = _env("SELENIUM_BASE_URL", "http://localhost:9002")
        admin_url = _env("SELENIUM_ADMIN_URL", "http://localhost:3005")
        api_url = _env("SELENIUM_API_URL", "http://localhost:4000")
        remote_webdriver_url = os.getenv("SELENIUM_REMOTE_URL")
        browser = os.getenv("SELENIUM_BROWSER", "chrome").lower()
        implicit_wait = float(os.getenv("SELENIUM_IMPLICIT_WAIT", "1.0"))
        explicit_wait = float(os.getenv("SELENIUM_EXPLICIT_WAIT", "10.0"))
        return cls(
            base_url=base_url,
            admin_url=admin_url,
            api_url=api_url,
            remote_webdriver_url=remote_webdriver_url,
            browser=browser,
            implicit_wait=implicit_wait,
            explicit_wait=explicit_wait,
        )


settings = Settings.load()
