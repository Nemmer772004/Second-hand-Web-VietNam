from __future__ import annotations

import pytest
from selenium import webdriver

from .config import settings
from .utils.driver import managed_driver


@pytest.fixture(scope="session")
def base_url() -> str:
    return settings.base_url


@pytest.fixture(scope="function")
def driver() -> webdriver.Remote:
    with managed_driver() as drv:
        yield drv


@pytest.fixture(scope="session")
def test_users() -> dict[str, dict[str, str]]:
    """Static credentials referenced across tests."""
    return {
        "existing_user": {
            "email": "namnamnamaa8@gmail.com",
            "password": "111111",
        },
        "new_user": {
            "name": "Trần Anh",
            "email": "anh.tran123@gmail.com",
            "password": "Test@123",
        },
        "duplicate_email": "admin@studio.local",
    }
