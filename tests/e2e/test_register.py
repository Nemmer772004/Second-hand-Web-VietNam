from __future__ import annotations

import pytest

from .pages.register import RegisterPage
from .utils.data import unique_email
from .config import settings


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

        driver.get(f"{settings.base_url}/account")
        assert "account" in driver.current_url

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
        errors = register_page.validation_errors()
        assert any("được sử dụng" in err.lower() for err in errors)

    def test_register_requires_valid_email(self, driver):
        register_page = RegisterPage(driver)
        register_page.load()
        register_page.fill_form(name="Invalid", email="namnam@", password="Test@123", agree=True)
        register_page.submit()
        errors = register_page.validation_errors()
        assert any("email" in err.lower() for err in errors)

    def test_register_requires_password_rules(self, driver):
        register_page = RegisterPage(driver)
        register_page.load()
        register_page.fill_form(name="Short", email=unique_email(), password="123", agree=True)
        register_page.submit()
        errors = register_page.validation_errors()
        assert any("ít nhất" in err.lower() for err in errors)

    def test_register_requires_agreement(self, driver):
        register_page = RegisterPage(driver)
        register_page.load()
        register_page.fill_form(name="NoAgree", email=unique_email(), password="Test@123", agree=False)
        register_page.submit()
        errors = register_page.validation_errors()
        assert any("đồng ý" in err.lower() for err in errors)

    def test_register_xss_guard(self, driver):
        register_page = RegisterPage(driver)
        register_page.load()
        malicious_name = "<script>alert('xss')</script>"
        register_page.fill_form(name=malicious_name, email=unique_email(), password="Test@123", agree=True)
        register_page.submit()
        toast = register_page.toast_message()
        assert toast is not None
        assert "<script>" not in toast[0]
