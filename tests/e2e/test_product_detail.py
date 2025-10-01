from __future__ import annotations

import pytest

from .pages.product_detail import ProductDetailPage
from .config import settings


@pytest.mark.selenium
class TestProductDetail:
    def test_view_product_detail(self, driver):
        page = ProductDetailPage(driver, slug="tu-lanh-cong-nghiep-4-canh")
        page.load() # Includes wait for title
        assert 'Tủ' in driver.title or page.price()

    @pytest.mark.usefixtures("logged_in_user")
    def test_add_to_cart_when_logged_in(self, driver):
        # User is already logged in by the fixture
        detail_page = ProductDetailPage(driver, slug="bep-ham-doi-inox")
        detail_page.load()
        detail_page.add_to_cart()
        
        # Wait for and verify the toast message
        toast = detail_page.toast()
        assert toast is not None, "Toast message did not appear after adding to cart"
        assert 'giỏ' in toast[1].lower(), f"Toast message was: {toast}"

    def test_add_to_cart_requires_login(self, driver):
        # This test must run with a logged-out user
        page = ProductDetailPage(driver, slug="bep-ham-doi-inox")
        page.load()
        page.add_to_cart()

        # Expect redirect to login when not authenticated
        page.wait.until(lambda d: "/login" in d.current_url)
        assert driver.current_url.startswith(f"{settings.base_url}/login")
