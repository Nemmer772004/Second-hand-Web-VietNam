from __future__ import annotations

import pytest
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from .config import settings
from .utils.driver import managed_driver
from .pages.login import LoginPage
from .pages.base import BasePage


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
            "password": "11111111",
        },
        "new_user": {
            "name": "Trần Anh",
            "email": "anh.tran123@gmail.com",
            "password": "11111111",
        },
        "duplicate_email": "admin@studio.local",
    }

@pytest.fixture(scope="function")
def logged_in_user(driver: webdriver.Remote, test_users: dict) -> None:
    """Fixture to log in a user and ensure logout after the test."""
    login_page = LoginPage(driver)
    login_page.load()
    creds = test_users["existing_user"]
    login_page.fill_form(email=creds["email"], password=creds["password"])
    login_page.submit()

    # Wait for login to be successful by checking for account URL or logout button
    WebDriverWait(driver, settings.explicit_wait).until(
        EC.any_of(
            EC.url_contains("/account"),
            EC.visibility_of_element_located(BasePage.LOGOUT_BUTTON)
        )
    )

    yield # Test runs here

    # Teardown: Logout
    base_page = BasePage(driver)
    base_page.logout()

@pytest.fixture(scope="function")
def logged_out_user(driver: webdriver.Remote) -> None:
    """Fixture to ensure no user is logged in before the test."""
    base_page = BasePage(driver)
    try:
        base_page.logout()
    except Exception:
        # If logout fails, it might be because we are already logged out.
        # Navigate to the login page to ensure a consistent state.
        driver.get(f"{settings.base_url}/login")
