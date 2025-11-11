from __future__ import annotations

from urllib.parse import urljoin

from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


class ProductDetailPage:
    main_image = (By.CSS_SELECTOR, "div.relative.aspect-square img")
    gallery_thumbnails = (By.CSS_SELECTOR, "div.grid.grid-cols-4 button img")
    product_title = (By.CSS_SELECTOR, "h1.font-headline")
    price_label = (By.CSS_SELECTOR, ".text-3xl.font-bold")
    description_section = (By.XPATH, "//h2[contains(., 'Mô tả chi tiết')]/following-sibling::p")
    rating_summary = (By.CSS_SELECTOR, ".text-4xl.font-bold.text-primary")
    add_to_cart_button = (By.XPATH, "//button[contains(., 'Thêm vào giỏ hàng')]")
    buy_now_button = (By.XPATH, "//button[contains(., 'Yêu cầu báo giá')]")
    toast_container = (By.CSS_SELECTOR, '[data-state=\"open\"][role=\"status\"]')
    toast_description = (By.CSS_SELECTOR, '[data-state=\"open\"] p')
    breadcrumb = (By.CSS_SELECTOR, "nav[aria-label='breadcrumb'], nav[aria-label='Breadcrumb']")
    related_products = (By.CSS_SELECTOR, "section div.grid a[href*='/products/']")
    review_items = (By.CSS_SELECTOR, "div.space-y-6 > div.rounded-lg.border.bg-card")
    review_empty_state = (By.XPATH, "//div[contains(., 'Chưa có đánh giá phù hợp')]")
    stock_badge = (By.XPATH, "//div[contains(@class, 'text-sm') and contains(., 'Còn lại')]")
    sold_badge = (By.XPATH, "//div[contains(@class, 'text-sm') and contains(., 'Đã bán')]")
    add_to_cart_toast = (By.XPATH, "//p[contains(., 'Đã thêm vào giỏ hàng')]")

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait = wait

    def open(self, base_url: str, product_id: str) -> None:
        target = urljoin(f"{base_url}/", f"products/{product_id}")
        self.driver.get(target)

    def wait_until_ready(self) -> None:
        self.wait.until(EC.visibility_of_element_located(self.product_title))

    def get_product_title(self) -> str:
        return self.driver.find_element(*self.product_title).text.strip()

    def get_price_label(self) -> str:
        return self.driver.find_element(*self.price_label).text.strip()

    def open_gallery_image(self, index: int = 0) -> None:
        thumbnails = self.driver.find_elements(*self.gallery_thumbnails)
        if index >= len(thumbnails):
            raise AssertionError("Không tồn tại ảnh phụ theo chỉ số yêu cầu.")
        thumbnails[index].click()

    def add_to_cart(self) -> None:
        self.driver.find_element(*self.add_to_cart_button).click()

    def open_buy_now(self) -> None:
        self.driver.find_element(*self.buy_now_button).click()

    def get_toast_message(self) -> str | None:
        try:
            self.wait.until(EC.visibility_of_element_located(self.toast_container))
        except TimeoutException:
            return None
        try:
            return self.driver.find_element(*self.toast_description).text.strip()
        except NoSuchElementException:
            return None

    def has_breadcrumb(self) -> bool:
        try:
            element = self.driver.find_element(*self.breadcrumb)
            return element.is_displayed()
        except NoSuchElementException:
            return False

    def get_review_count(self) -> int:
        reviews = self.driver.find_elements(*self.review_items)
        return len(reviews)

    def has_review_empty_state(self) -> bool:
        try:
            return self.driver.find_element(*self.review_empty_state).is_displayed()
        except NoSuchElementException:
            return False

    def get_stock_label(self) -> str | None:
        try:
            return self.driver.find_element(*self.stock_badge).text.strip()
        except NoSuchElementException:
            return None

    def get_sold_label(self) -> str | None:
        try:
            return self.driver.find_element(*self.sold_badge).text.strip()
        except NoSuchElementException:
            return None
