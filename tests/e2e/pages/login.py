"""Page object for the /login screen — no delay version"""
from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

from .base import BasePage
from ..config import settings


class LoginPage(BasePage):
    URL = f"{settings.base_url}/login"

    EMAIL_INPUT = (By.NAME, "email")
    PASSWORD_INPUT = (By.NAME, "password")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    TOAST_SELECTOR = (By.CSS_SELECTOR, "[data-sonner-toast]")
    TOAST_TITLE = (By.CSS_SELECTOR, "[data-sonner-toast] [data-title]")
    TOAST_DESCRIPTION = (By.CSS_SELECTOR, "[data-sonner-toast] [data-description]")

    def __init__(self, driver: WebDriver) -> None:
        super().__init__(driver)

    def load(self) -> None:
        self.driver.get(self.URL)

    def fill_form(self, *, email: str, password: str) -> None:
        try:
            self.driver.find_element(*self.EMAIL_INPUT).send_keys(email.strip())
            self.driver.find_element(*self.PASSWORD_INPUT).send_keys(password)
        except Exception as e:
            print(f"[ERROR] Lỗi khi nhập form: {e}")

    def submit(self) -> None:
        try:
            button = self.driver.find_element(*self.SUBMIT_BUTTON)
            self.driver.execute_script("arguments[0].scrollIntoView(true);", button)
            button.click()
        except Exception:
            try:
                self.driver.execute_script("arguments[0].click();", button)
            except Exception as e:
                print(f"[ERROR] Không click được submit: {e}")

    def toast_message(self) -> tuple[str, str] | None:
        try:
            title = self.driver.find_element(*self.TOAST_TITLE).text
            description = self.driver.find_element(*self.TOAST_DESCRIPTION).text
            return title, description
        except Exception:
            return None
