"""Page object for the /products listing."""
from __future__ import annotations

from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC

from .base import BasePage
from ..config import settings


class ProductsPage(BasePage):
    URL = f"{settings.base_url}/products"

    SEARCH_INPUT = (By.CSS_SELECTOR, "input[type='search'][placeholder='Tìm trong kết quả...']")
    CATEGORY_SECTION = (By.XPATH, "//h2[contains(., 'Bộ lọc')]")
    CATEGORY_CHECKBOX_BY_LABEL = "//label[normalize-space()='{label}']/preceding-sibling::*[contains(@role,'checkbox')]"
    MATERIAL_CHECKBOX_BY_LABEL = "//label[normalize-space()='{label}']/preceding-sibling::*[contains(@role,'checkbox')]"
    RESET_FILTER_BUTTON = (By.XPATH, "//button[normalize-space()='Xóa bộ lọc']")
    PRODUCT_CARD_TITLES = (By.CSS_SELECTOR, "[data-testid='product-card'] h3, article h3")
    PRODUCT_COUNT = (By.XPATH, "//main//p[contains(@class,'text-muted-foreground')]" )
    SORT_TRIGGER = (By.CSS_SELECTOR, "button[role='combobox']")
    SORT_OPTION_BY_VALUE = "//div[@role='option' and @data-value='{value}']"
    SLIDER_HANDLE = (By.CSS_SELECTOR, "[role='slider']")
    EMPTY_STATE = (By.XPATH, "//h3[contains(.,'Không tìm thấy sản phẩm')]")

    def __init__(self, driver: WebDriver) -> None:
        super().__init__(driver)

    def load(self) -> None:
        self.open(self.URL)
        self.wait_for_visible(self.SEARCH_INPUT)

    def search(self, term: str) -> None:
        self.fill_input(self.SEARCH_INPUT, term)

    def toggle_category(self, label: str) -> None:
        locator = (By.XPATH, self.CATEGORY_CHECKBOX_BY_LABEL.format(label=label))
        self.wait_for_clickable(locator)
        self.driver.find_element(*locator).click()

    def toggle_material(self, label: str) -> None:
        locator = (By.XPATH, self.MATERIAL_CHECKBOX_BY_LABEL.format(label=label))
        self.wait_for_clickable(locator)
        self.driver.find_element(*locator).click()

    def reset_filters(self) -> None:
        self.click(self.RESET_FILTER_BUTTON)

    def set_price_slider(self, target_percentage: float) -> None:
        """Drag slider handle to approximate value by percentage (0..1)."""
        handle = self.driver.find_element(*self.SLIDER_HANDLE)
        width = handle.size['width'] or 1
        offset = int(width * (target_percentage - 1))  # slider only available up to max, adjust relative
        actions = ActionChains(self.driver)
        actions.click_and_hold(handle).move_by_offset(offset, 0).release().perform()

    def select_sort(self, value: str) -> None:
        self.click(self.SORT_TRIGGER)
        option = (By.XPATH, self.SORT_OPTION_BY_VALUE.format(value=value))
        self.wait_for_clickable(option)
        self.driver.find_element(*option).click()

    def product_titles(self) -> list[str]:
        return [el.text.strip() for el in self.driver.find_elements(*self.PRODUCT_CARD_TITLES) if el.text.strip()]

    def product_count_text(self) -> str:
        return self.text_of(self.PRODUCT_COUNT)

    def has_no_results(self) -> bool:
        return self.is_displayed(self.EMPTY_STATE)
