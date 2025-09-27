"""Page object for the /cart page."""
from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

from .base import BasePage
from ..config import settings


class CartPage(BasePage):
    URL = f"{settings.base_url}/cart"

    EMPTY_STATE = (By.XPATH, "//h1[contains(.,'Giỏ Hàng Của Bạn Đang Trống')]")
    CART_ITEM = (By.CSS_SELECTOR, "div[data-testid='cart-item'], div[data-cart-item]")
    ITEM_NAME = (By.CSS_SELECTOR, "a.font-bold")
    ITEM_QUANTITY = (By.XPATH, ".//span[normalize-space() and not(ancestor::button)]")
    INCREASE_BUTTON = (By.XPATH, ".//button[@aria-label='Increase' or .//svg[@data-icon='plus']] | .//button[contains(@class,'w-8')][2]")
    DECREASE_BUTTON = (By.XPATH, ".//button[@aria-label='Decrease' or .//svg[@data-icon='minus']] | .//button[contains(@class,'w-8')][1]")
    REMOVE_BUTTON = (By.XPATH, ".//button[contains(@class,'text-muted-foreground') and .//svg]")
    CLEAR_CART_BUTTON = (By.XPATH, "//button[normalize-space()='Xóa Giỏ Hàng']")
    CHECKOUT_BUTTON = (By.XPATH, "//button[contains(.,'Đặt hàng') or contains(.,'Thanh toán')]" )
    ADDRESS_TEXTAREA = (By.CSS_SELECTOR, "textarea[placeholder*='Ví dụ']")
    PAYMENT_SELECT = (By.CSS_SELECTOR, "select")
    NOTE_TEXTAREA = (By.CSS_SELECTOR, "textarea[placeholder*='Lưu ý']")
    ERROR_ALERT = (By.CSS_SELECTOR, "div.text-destructive, p.text-destructive")

    def __init__(self, driver: WebDriver) -> None:
        super().__init__(driver)

    def load(self) -> None:
        self.open(self.URL)

    def is_empty(self) -> bool:
        return self.is_displayed(self.EMPTY_STATE)

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
