from __future__ import annotations

import pytest

from .pages.login import LoginPage
from .pages.product_detail import ProductDetailPage
from .pages.cart import CartPage
from .utils.data import CheckoutData


@pytest.mark.selenium
class TestCheckout:
    def _prepare_cart(self, driver, test_users):
        login_page = LoginPage(driver)
        login_page.load()
        login_page.fill_form(**test_users["existing_user"])
        login_page.submit()
        cart_page = CartPage(driver)
        cart_page.load()
        if not cart_page.is_empty():
            cart_page.clear_cart()
        detail_page = ProductDetailPage(driver, slug="tu-lanh-cong-nghiep-4-canh")
        detail_page.load()
        detail_page.add_to_cart()
        detail_page = ProductDetailPage(driver, slug="bep-ham-doi-inox")
        detail_page.load()
        detail_page.add_to_cart()

    def test_checkout_success(self, driver, test_users):
        self._prepare_cart(driver, test_users)
        cart_page = CartPage(driver)
        cart_page.load()
        data = CheckoutData()
        cart_page.fill_shipping(data.address, note=data.note)
        cart_page.choose_payment('cod')
        cart_page.submit_order()
        # After success, cart should redirect to account orders page
        assert "account" in driver.current_url

    def test_checkout_missing_address(self, driver, test_users):
        self._prepare_cart(driver, test_users)
        cart_page = CartPage(driver)
        cart_page.load()
        cart_page.fill_shipping("")
        cart_page.submit_order()
        assert cart_page.error_message() is not None
