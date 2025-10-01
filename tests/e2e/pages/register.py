"""Page object for the /register screen."""
from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

from .base import BasePage, ByT
from ..config import settings


class RegisterPage(BasePage):
    URL = f"{settings.base_url}/register"

    NAME_INPUT = (By.NAME, "name")
    EMAIL_INPUT = (By.NAME, "email")
    PASSWORD_INPUT = (By.NAME, "password")
    AGREEMENT_CHECKBOX = (By.CSS_SELECTOR, "[role='checkbox']")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    TOAST_TITLE = (By.CSS_SELECTOR, "[data-sonner-toast] [data-title]")
    TOAST_DESCRIPTION = (By.CSS_SELECTOR, "[data-sonner-toast] [data-description]")
    ERROR_MESSAGES = (By.CSS_SELECTOR, "p[role='alert']")

    def __init__(self, driver: WebDriver) -> None:
        super().__init__(driver)

    def load(self) -> None:
        self.open(self.URL)
        self.wait_for_visible(self.NAME_INPUT)

    def fill_form(self, *, name: str, email: str, password: str, agree: bool) -> None:
        self.fill_input(self.NAME_INPUT, name)
        self.fill_input(self.EMAIL_INPUT, email)
        self.fill_input(self.PASSWORD_INPUT, password)
        if agree:
            checkbox = self.driver.find_element(*self.AGREEMENT_CHECKBOX)
            if checkbox.get_attribute("data-state") != "checked":
                checkbox.click()
        else:
            checkbox = self.driver.find_element(*self.AGREEMENT_CHECKBOX)
            if checkbox.get_attribute("data-state") == "checked":
                checkbox.click()

    def submit(self) -> None:
        self.click(self.SUBMIT_BUTTON)

    def toast_message(self) -> tuple[str, str] | None:
        try:
            self.wait_for_visible(self.TOAST_TITLE)
            title = self.text_of(self.TOAST_TITLE)
            description = self.text_of(self.TOAST_DESCRIPTION)
            return title, description
        except Exception:
            return None

    def validation_errors(self) -> list[str]:
        return [el.text.strip() for el in self.driver.find_elements(*self.ERROR_MESSAGES) if el.text.strip()]
