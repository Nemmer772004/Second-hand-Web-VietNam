from __future__ import annotations

import pytest

from .pages.products import ProductsPage


@pytest.mark.selenium
class TestProducts:
    def test_filter_by_category_and_search(self, driver):
        page = ProductsPage(driver)
        page.load()
        page.toggle_category('Đồ Điện Lạnh Cũ')
        page.search('tủ')
        titles = page.product_titles()
        assert titles, 'Expected at least one product after filtering'
        assert all('tủ' in title.lower() for title in titles)

    def test_reset_filters(self, driver):
        page = ProductsPage(driver)
        page.load()
        page.toggle_category('Đồ Nhà Hàng Cũ')
        page.search('bếp')
        page.reset_filters()
        assert '0 sản phẩm' not in page.product_count_text()

    def test_empty_state(self, driver):
        page = ProductsPage(driver)
        page.load()
        page.search('sản phẩm không tồn tại xyz')
        assert page.has_no_results()
