from __future__ import annotations

import pytest
from selenium.webdriver.support import expected_conditions as EC

from .pages.products import ProductsPage


@pytest.mark.selenium
class TestProducts:
    def test_filter_by_category_and_search(self, driver):
        page = ProductsPage(driver)
        page.load()
        product_cards = page.driver.find_elements(*page.PRODUCT_CARD_TITLES)
        assert product_cards, "No product cards were found on the products page."

        page.toggle_category('Đồ Điện Lạnh Cũ')
        page.wait.until(EC.staleness_of(product_cards[0]))

        page.search('tủ')
        # Re-find elements after DOM change
        product_cards = page.driver.find_elements(*page.PRODUCT_CARD_TITLES)
        assert product_cards, "No product cards were found after searching."
        page.wait.until(EC.staleness_of(product_cards[0]))

        titles = page.product_titles()
        assert titles, 'Expected at least one product after filtering'
        assert all('tủ' in title.lower() for title in titles)

    def test_reset_filters(self, driver):
        page = ProductsPage(driver)
        page.load()
        product_cards = page.driver.find_elements(*page.PRODUCT_CARD_TITLES)
        assert product_cards, "No product cards were found on the products page."

        page.toggle_category('Đồ Nhà Hàng Cũ')
        page.wait.until(EC.staleness_of(product_cards[0]))
        page.search('bàn')
        product_cards = page.driver.find_elements(*page.PRODUCT_CARD_TITLES)
        assert product_cards, "No product cards were found after searching."
        page.wait.until(EC.staleness_of(product_cards[0]))

        page.reset_filters()
        product_cards = page.driver.find_elements(*page.PRODUCT_CARD_TITLES)
        assert product_cards, "No product cards were found after resetting filters."
        page.wait.until(EC.staleness_of(product_cards[0]))

        assert '0 sản phẩm' not in page.product_count_text()
        
    def test_just_load_page_and_check_title(self, driver):
        page = ProductsPage(driver)
        page.load()
        assert 'bảo anh' in driver.title.lower()

    def test_empty_state(self, driver):
        page = ProductsPage(driver)
        page.load()
        page.wait_for_visible(page.SEARCH_INPUT)
        page.search('sản phẩm không tồn tại xyz')
        page.wait_for_visible(page.EMPTY_STATE)
        assert page.has_no_results()
