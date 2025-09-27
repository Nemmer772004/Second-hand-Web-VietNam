from __future__ import annotations

import pytest

from .pages.product_detail import ProductDetailPage
from .pages.login import LoginPage
from .config import settings


@pytest.mark.selenium
class TestProductDetail:
    def test_view_product_detail(self, driver):
        page = ProductDetailPage(driver, slug="tu-lanh-cong-nghiep-4-canh")
        page.load()
        assert 'Tủ' in driver.title or page.price()

    def test_add_to_cart_requires_login(self, driver):
        page = ProductDetailPage(driver, slug="bep-ham-doi-inox")
        page.load()
        page.add_to_cart()
        # Expect redirect to login when not authenticated
        assert driver.current_url.startswith(f"{settings.base_url}/login")

    def test_add_to_cart_when_logged_in(self, driver, test_users):
        login_page = LoginPage(driver)
        login_page.load()
        login_page.fill_form(**test_users["existing_user"])
        login_page.submit()
        detail_page = ProductDetailPage(driver, slug="bep-ham-doi-inox")
        detail_page.load()
        detail_page.add_to_cart()
        toast = detail_page.toast()
        assert toast is not None and 'giỏ' in toast[1].lower()
