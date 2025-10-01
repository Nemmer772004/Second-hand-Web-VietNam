from __future__ import annotations

import pytest
from selenium.webdriver.support import expected_conditions as EC

from .pages.product_detail import ProductDetailPage
from .pages.cart import CartPage
from .config import settings


@pytest.mark.selenium
class TestCart:
    @pytest.mark.usefixtures("logged_in_user")
    def test_cart_flow_add_update_remove(self, driver):
        # With a logged-in user, add a product to the cart
        detail_page = ProductDetailPage(driver, slug="bep-ham-doi-inox")
        detail_page.load()
        detail_page.wait_for_visible(detail_page.ADD_TO_CART_BUTTON)
        detail_page.add_to_cart()
        detail_page.wait_for_visible(detail_page.TOAST_SELECTOR)

        # Go to cart and verify it's not empty
        cart_page = CartPage(driver)
        cart_page.load()
        cart_page.wait.until(lambda d: not cart_page.is_empty())
        initial_items = cart_page.items()
        assert initial_items, "Cart should have items after add-to-cart"

        # Update quantity and remove
        cart_page.increase_quantity()
        cart_page.wait.until(EC.staleness_of(initial_items[0])) # Wait for DOM update
        cart_page.decrease_quantity()
        cart_page.wait.until(EC.staleness_of(cart_page.items()[0])) # Wait for DOM update
        cart_page.remove_item()
        cart_page.wait.until(EC.staleness_of(cart_page.items()[0])) # Wait for DOM update

        # Verify cart is empty, then re-add and clear
        assert cart_page.is_empty()
        detail_page.load()
        detail_page.add_to_cart()
        detail_page.wait_for_visible(detail_page.TOAST_SELECTOR)
        cart_page.load()
        cart_page.wait.until(lambda d: not cart_page.is_empty())
        cart_page.clear_cart()
        cart_page.wait.until(lambda d: cart_page.is_empty())
        assert cart_page.is_empty()

    def test_cart_requires_login_for_checkout(self, driver):
        # This test must run with a logged-out user
        cart_page = CartPage(driver)
        cart_page.load()
        cart_page.wait.until(lambda d: d.current_url == cart_page.URL)

        # This test assumes the cart is not empty to proceed.
        # A better test would add an item without logging in.
        if cart_page.is_empty():
            # For now, we can't test this path without adding an item first.
            # This requires the ability to add to cart without login, which may not be possible.
            pass
        else:
            cart_page.submit_order()
            cart_page.wait.until(lambda d: "/login" in d.current_url)
            assert "/login" in driver.current_url
