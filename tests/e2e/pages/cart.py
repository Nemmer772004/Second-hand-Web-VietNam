"""Page object for the /cart page."""
from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from .base import BasePage
from ..config import settings


class CartPage(BasePage):
    URL = f"{settings.base_url}/cart"

    EMPTY_STATE = (By.XPATH, "//h1[contains(.,'Giỏ Hàng Của Bạn Đang Trống')]")
    CART_ITEM = (By.CSS_SELECTOR, "div[data-testid='cart-item'], div[data-cart-item]")
    ITEM_NAME = (By.CSS_SELECTOR, "a.font-bold")
    ITEM_QUANTITY = (By.XPATH, ".//span[normalize-space() and not(ancestor::button)]")
    INCREASE_BUTTON = (By.XPATH, ".//button[.//svg[contains(@class, 'lucide-plus')]]")
    DECREASE_BUTTON = (By.XPATH, ".//button[.//svg[contains(@class, 'lucide-minus')]]")
    REMOVE_BUTTON = (By.XPATH, ".//button[.//svg[contains(@class, 'lucide-x')]]")
    CLEAR_CART_BUTTON = (By.XPATH, "//button[normalize-space()='Xóa hết']")
    CHECKOUT_BUTTON = (By.XPATH, "//button[normalize-space()='Đặt hàng']")
    ADDRESS_TEXTAREA = (By.NAME, "address")
    PAYMENT_SELECT = (By.NAME, "paymentMethod")
    NOTE_TEXTAREA = (By.NAME, "note")
    ERROR_ALERT = (By.CSS_SELECTOR, "div.text-destructive, p.text-destructive")
    ITEM_TOTAL = (By.CSS_SELECTOR, "div.text-right > p.font-semibold")

    def __init__(self, driver: WebDriver) -> None:
        super().__init__(driver)

    def load(self) -> None:
        self.open(self.URL)

    def is_empty(self) -> bool:
        try:
            # A short wait can make this more robust
            WebDriverWait(self.driver, 2).until(
                EC.visibility_of_element_located(self.EMPTY_STATE)
            )
            return True
        except Exception:
            return False

    def items(self):
        return self.driver.find_elements(*self.CART_ITEM)

    def first_item(self):
        items = self.items()
        return items[0] if items else None

    def increase_quantity(self, item_index: int = 0) -> None:
        item = self.items()[item_index]
        button = item.find_element(*self.INCREASE_BUTTON)
        button.click()

    def decrease_quantity(self, item_index: int = 0) -> None:
        item = self.items()[item_index]
        button = item.find_element(*self.DECREASE_BUTTON)
        button.click()

    def remove_item(self, item_index: int = 0) -> None:
        item = self.items()[item_index]
        item.find_element(*self.REMOVE_BUTTON).click()

    def clear_cart(self) -> None:
        if self.is_displayed(self.CLEAR_CART_BUTTON):
            self.click(self.CLEAR_CART_BUTTON)

    def item_total_text(self, item_index: int = 0) -> str:
        item = self.items()[item_index]
        return item.find_element(*self.ITEM_TOTAL).text.strip()

    def fill_shipping(self, address: str, note: str | None = None) -> None:
        self.fill_input(self.ADDRESS_TEXTAREA, address)
        if note is not None:
            self.fill_input(self.NOTE_TEXTAREA, note)

    def choose_payment(self, method: str) -> None:
        select = self.driver.find_element(*self.PAYMENT_SELECT)
        select.click()
        option = select.find_element(By.CSS_SELECTOR, f"option[value='{method}']")
        option.click()

    def submit_order(self) -> None:
        self.click(self.CHECKOUT_BUTTON)

    def error_message(self) -> str | None:
        elements = self.driver.find_elements(*self.ERROR_ALERT)
        for element in elements:
            text = element.text.strip()
            if text:
                return text
        return None
