from __future__ import annotations

import pytest

from .pages.register import RegisterPage
from .utils.data import unique_email
from .config import settings


@pytest.mark.usefixtures("logged_out_user")
@pytest.mark.selenium
class TestRegister:
    def test_register_success(self, driver, test_users):
        register_page = RegisterPage(driver)
        register_page.load()
        new_email = unique_email(prefix="homeharmony")
        register_page.fill_form(
            name=test_users["new_user"]["name"],
            email=new_email,
            password=test_users["new_user"]["password"],
            agree=True,
        )
        register_page.submit()
        
        toast = register_page.toast_message()
        assert toast is not None and "Tài khoản" in toast[0]

        # After successful registration, user is auto-logged in
        register_page.wait.until(lambda d: "/account" in d.current_url)
        assert "/account" in driver.current_url

    def test_register_duplicate_email(self, driver, test_users):
        register_page = RegisterPage(driver)
        register_page.load()
        register_page.fill_form(
            name="Người dùng trùng", 
            email=test_users["duplicate_email"],
            password=test_users["new_user"]["password"],
            agree=True,
        )
        register_page.submit()
        
        register_page.wait_for_visible(register_page.ERROR_MESSAGES)
        errors = register_page.validation_errors()
        assert any("được sử dụng" in err.lower() for err in errors)
