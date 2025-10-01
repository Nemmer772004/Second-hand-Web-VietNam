from __future__ import annotations

import pytest

from .pages.product_detail import ProductDetailPage
from .pages.cart import CartPage
from .utils.data import CheckoutData


@pytest.mark.selenium
class TestCheckout:
    def _prepare_cart(self, driver):
        """Ensures the cart is ready for checkout."""
        cart_page = CartPage(driver)
        cart_page.load()
        cart_page.wait.until(lambda d: d.current_url == cart_page.URL)

        # Clear cart if not empty
        if not cart_page.is_empty():
            cart_page.clear_cart()
            cart_page.wait.until(lambda d: cart_page.is_empty())

        # Add items for checkout
        product_slugs = ["tu-lanh-cong-nghiep-4-canh", "bep-ham-doi-inox"]
        for slug in product_slugs:
            detail_page = ProductDetailPage(driver, slug=slug)
            detail_page.load()
            detail_page.wait_for_visible(detail_page.ADD_TO_CART_BUTTON)
            detail_page.add_to_cart()
            # Wait for toast to confirm
            detail_page.wait_for_visible(detail_page.TOAST_SELECTOR)

    @pytest.mark.usefixtures("logged_in_user")
    def test_checkout_success_cod(self, driver):
        self._prepare_cart(driver)
        cart_page = CartPage(driver)
        cart_page.load()
        cart_page.submit_order() # Click "Đặt hàng" to open form
        cart_page.wait_for_visible(cart_page.ADDRESS_TEXTAREA)

        data = CheckoutData()
        cart_page.fill_shipping(data.address, note=data.note)
        cart_page.choose_payment('cod')
        cart_page.submit_order() # Click again to finalize
        
        cart_page.wait.until(lambda d: "/account" in d.current_url)
        assert "/account" in driver.current_url

    @pytest.mark.usefixtures("logged_in_user")
    def test_checkout_success_bank(self, driver):
        self._prepare_cart(driver)
        cart_page = CartPage(driver)
        cart_page.load()
        cart_page.submit_order()
        cart_page.wait_for_visible(cart_page.ADDRESS_TEXTAREA)

        data = CheckoutData()
        cart_page.fill_shipping(data.address, note=data.note)
        cart_page.choose_payment('bank')
        cart_page.submit_order()

        cart_page.wait.until(lambda d: "/account" in d.current_url)
        assert "/account" in driver.current_url

    @pytest.mark.usefixtures("logged_in_user")
    def test_checkout_missing_address(self, driver):
        self._prepare_cart(driver)
        cart_page = CartPage(driver)
        cart_page.load()
        cart_page.submit_order()
        cart_page.wait_for_visible(cart_page.ADDRESS_TEXTAREA)

        cart_page.fill_shipping("") # Missing address
        cart_page.submit_order()
        
        cart_page.wait_for_visible(cart_page.ERROR_ALERT)
        assert cart_page.error_message() is not None
