from __future__ import annotations

from urllib.parse import urlencode, urljoin

from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver import ActionChains, Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


class ProductListPage:
    path = "/products"

    search_input = (By.CSS_SELECTOR, "aside input[type='search']")
    product_cards = (By.CSS_SELECTOR, "main .group.relative.flex.flex-col")
    product_card_titles = (By.CSS_SELECTOR, "main .group.relative.flex.flex-col h3")
    category_checkbox_template = "label[for='category-{}']"
    reset_button = (By.XPATH, "//aside//button[contains(., 'Xóa bộ lọc') or contains(., 'Làm mới')]")
    result_counter = (By.CSS_SELECTOR, "main p.text-muted-foreground")
    sort_trigger = (By.CSS_SELECTOR, "[role='combobox']")
    sort_option_template = "//div[@role='option' and contains(., '{}')]"
    pagination_next = (By.CSS_SELECTOR, "nav[aria-label='Pagination'] a[rel='next']")
    slider_thumb = (By.CSS_SELECTOR, "[role='slider']")
    empty_state = (By.CSS_SELECTOR, "main .text-center h3")

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait = wait

    def open(self, base_url: str, params: dict | None = None) -> None:
        query = f"?{urlencode(params)}" if params else ""
        target = urljoin(f"{base_url}/", f"{self.path.lstrip('/')}{query}")
        self.driver.get(target)

    def wait_until_ready(self) -> None:
        self.wait.until(EC.visibility_of_element_located(self.product_cards))

    def get_product_names(self) -> list[str]:
        return [el.text.strip() for el in self.driver.find_elements(*self.product_card_titles)]

    def search(self, query: str) -> None:
        field = self.driver.find_element(*self.search_input)
        field.clear()
        field.send_keys(query)
        field.send_keys(Keys.ENTER)

    def select_category_by_label(self, label: str) -> None:
        label_element = self.driver.find_element(By.XPATH, f"//aside//label[normalize-space()='{label}']")
        checkbox_id = label_element.get_attribute("for")
        if not checkbox_id:
            label_element.click()
            return
        checkbox = self.driver.find_element(By.ID, checkbox_id)
        checkbox.click()

    def toggle_material(self, material: str) -> None:
        material_element = self.driver.find_element(By.XPATH, f"//aside//label[normalize-space()='{material}']")
        checkbox_id = material_element.get_attribute("for")
        if checkbox_id:
            self.driver.find_element(By.ID, checkbox_id).click()
        else:
            material_element.click()

    def adjust_price_slider_max(self, target_value: int) -> None:
        try:
            slider = self.driver.find_element(*self.slider_thumb)
        except NoSuchElementException:
            raise AssertionError("Không tìm thấy slider giá để điều chỉnh.")

        ActionChains(self.driver).click(slider).perform()
        current_value = int(slider.get_attribute("aria-valuenow") or 0)
        step = 200000
        iterations = min(200, abs(target_value - current_value) // step + 1)
        key = Keys.ARROW_RIGHT if target_value > current_value else Keys.ARROW_LEFT
        for _ in range(iterations):
            slider.send_keys(key)

    def open_product_by_name(self, name: str) -> None:
        link = self.driver.find_element(By.XPATH, f"//main//h3[contains(., '{name}')]//a")
        link.click()

    def apply_sort(self, label: str) -> None:
        trigger = self.driver.find_element(*self.sort_trigger)
        trigger.click()
        option = self.driver.find_element(By.XPATH, self.sort_option_template.format(label))
        option.click()

    def click_reset_filters(self) -> None:
        button = self.driver.find_element(*self.reset_button)
        button.click()

    def has_pagination(self) -> bool:
        try:
            self.driver.find_element(*self.pagination_next)
            return True
        except NoSuchElementException:
            return False

    def wait_for_results_update(self) -> None:
        self.wait.until(EC.presence_of_all_elements_located(self.product_cards))

    def get_result_count_text(self) -> str | None:
        try:
            return self.driver.find_element(*self.result_counter).text
        except NoSuchElementException:
            return None

    def is_empty_state_visible(self) -> bool:
        try:
            empty = self.driver.find_element(*self.empty_state)
            return empty.is_displayed()
        except NoSuchElementException:
            return False
