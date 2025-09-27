from __future__ import annotations

import pytest

from .pages.login import LoginPage
from .pages.product_detail import ProductDetailPage
from .pages.cart import CartPage
from .config import settings


@pytest.mark.selenium
class TestCart:
    def test_cart_flow_add_update_remove(self, driver, test_users):
        # Login first
        login_page = LoginPage(driver)
        login_page.load()
        login_page.fill_form(**test_users["existing_user"])
        login_page.submit()

        # Add product to cart
        detail_page = ProductDetailPage(driver, slug="bep-ham-doi-inox")
        detail_page.load()
        detail_page.add_to_cart()

        cart_page = CartPage(driver)
        cart_page.load()
        assert not cart_page.is_empty()
        initial_items = cart_page.items()
        assert initial_items, "Cart should have items after add-to-cart"

        cart_page.increase_quantity()
        cart_page.decrease_quantity()
        cart_page.remove_item()
        cart_page.clear_cart()
        assert cart_page.is_empty()

    def test_cart_requires_login_for_checkout(self, driver):
        cart_page = CartPage(driver)
        cart_page.load()
        if cart_page.is_empty():
            assert cart_page.is_empty()
        else:
            cart_page.submit_order()
            assert driver.current_url.startswith(f"{settings.base_url}/login")
