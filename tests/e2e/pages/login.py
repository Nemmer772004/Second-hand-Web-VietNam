"""Page object for the /login screen."""
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
        self.open(self.URL)
        self.wait_for_visible(self.EMAIL_INPUT)

    def fill_form(self, *, email: str, password: str) -> None:
        self.fill_input(self.EMAIL_INPUT, email)
        self.fill_input(self.PASSWORD_INPUT, password)

    def submit(self) -> None:
        self.click(self.SUBMIT_BUTTON)

    def toast_message(self) -> tuple[str, str] | None:
        if not self.is_displayed(self.TOAST_SELECTOR):
            return None
        title = self.text_of(self.TOAST_TITLE)
        description = self.text_of(self.TOAST_DESCRIPTION)
        return title, description
