"""Page object for product detail screens."""
from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

from .base import BasePage
from ..config import settings


class ProductDetailPage(BasePage):
    PRODUCT_TITLE = (By.CSS_SELECTOR, "h1, h2")
    ADD_TO_CART_BUTTON = (By.XPATH, "//button[contains(., 'Thêm vào giỏ')]")
    BREADCRUMB = (By.CSS_SELECTOR, "nav[aria-label='breadcrumb']")
    TOAST_SELECTOR = (By.CSS_SELECTOR, "[data-sonner-toast]")
    TOAST_TITLE = (By.CSS_SELECTOR, "[data-sonner-toast] [data-title]")
    PRICE_TEXT = (By.CSS_SELECTOR, "[data-testid='product-price'] span, .text-3xl")

    def __init__(self, driver: WebDriver, slug: str) -> None:
        super().__init__(driver)
        self.url = f"{settings.base_url}/products/{slug}"

    def load(self) -> None:
        self.open(self.url)
        self.wait_for_visible(self.PRODUCT_TITLE)

    def add_to_cart(self) -> None:
        if self.is_displayed(self.ADD_TO_CART_BUTTON):
            self.click(self.ADD_TO_CART_BUTTON)

    def toast(self) -> tuple[str, str] | None:
        if not self.is_displayed(self.TOAST_SELECTOR):
            return None
        title = self.text_of(self.TOAST_TITLE)
        description_locator = (By.CSS_SELECTOR, "[data-sonner-toast] [data-description]")
        description = self.text_of(description_locator)
        return title, description

    def price(self) -> str:
        return self.text_of(self.PRICE_TEXT)
