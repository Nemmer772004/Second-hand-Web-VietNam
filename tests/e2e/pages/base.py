"""Base page object helpers."""
from __future__ import annotations

from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

from ..config import settings


class BasePage:
    # Assuming logout is triggered by a button/link with text 'Đăng xuất'
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(., 'Đăng xuất')] | //a[contains(., 'Đăng xuất')]")
    LOGIN_URL = f"{settings.base_url}/login"

    def __init__(self, driver: WebDriver) -> None:
        self.driver = driver
        self.wait = WebDriverWait(driver, settings.explicit_wait)

    def open(self, url: str) -> None:
        self.driver.get(url)

    def wait_for_visible(self, locator: tuple[str, str]) -> None:
        self.wait.until(EC.visibility_of_element_located(locator))

    def wait_for_clickable(self, locator: tuple[str, str]) -> None:
        self.wait.until(EC.element_to_be_clickable(locator))

    def fill_input(self, locator: tuple[str, str], value: str, clear: bool = True) -> None:
        element = self.driver.find_element(*locator)
        if clear:
            element.clear()
        element.send_keys(value)

    def click(self, locator: tuple[str, str]) -> None:
        self.wait_for_clickable(locator)
        self.driver.find_element(*locator).click()

    def text_of(self, locator: tuple[str, str]) -> str:
        self.wait_for_visible(locator)
        return self.driver.find_element(*locator).text.strip()

    def is_displayed(self, locator: tuple[str, str]) -> bool:
        try:
            return self.driver.find_element(*locator).is_displayed()
        except Exception:
            return False

    def logout(self) -> None:
        """Logs the user out by finding and clicking a logout button."""
        # Try clicking logout from the current page, if available
        if self.is_displayed(self.LOGOUT_BUTTON):
            self.click(self.LOGOUT_BUTTON)
        else:
            # As a fallback, go to the account page where it's likely to be
            self.open(f"{settings.base_url}/account")
            self.wait_for_clickable(self.LOGOUT_BUTTON)
            self.click(self.LOGOUT_BUTTON)
        
        # Wait until the URL reflects a logged-out state
        self.wait.until(EC.url_contains("/login"))


ByT = By  # alias to shorten imports in child classes
