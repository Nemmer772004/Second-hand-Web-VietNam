from __future__ import annotations

import pytest

from .pages.login import LoginPage
from .config import settings
from .utils.data import unique_email


@pytest.mark.selenium
class TestLogin:
    def test_login_success(self, driver, test_users):
        login_page = LoginPage(driver)
        login_page.load()
        creds = test_users["existing_user"]
        login_page.fill_form(email=creds["email"], password=creds["password"])
        login_page.submit()
        toast = login_page.toast_message()
        assert toast is not None and "Đăng nhập" in toast[0]
        assert driver.current_url.startswith(f"{settings.base_url}/account")

    def test_login_wrong_password(self, driver, test_users):
        login_page = LoginPage(driver)
        login_page.load()
        login_page.fill_form(email=test_users["existing_user"]["email"], password="wrong123")
        login_page.submit()
        toast = login_page.toast_message()
        assert toast is not None and "Đăng nhập thất bại" in toast[0]

    def test_login_unknown_email(self, driver):
        login_page = LoginPage(driver)
        login_page.load()
        login_page.fill_form(email=unique_email(), password="Whatever123")
        login_page.submit()
        toast = login_page.toast_message()
        assert toast is not None and "không hợp lệ" in toast[1]

    def test_login_invalid_format(self, driver):
        login_page = LoginPage(driver)
        login_page.load()
        login_page.fill_form(email="abc@", password="Secret123")
        login_page.submit()
        toast = login_page.toast_message()
        assert toast is None  # validation prevents submit

    def test_login_sql_injection_rejected(self, driver):
        login_page = LoginPage(driver)
        login_page.load()
        login_page.fill_form(email='" or "1"="1', password="irrelevant")
        login_page.submit()
        toast = login_page.toast_message()
        assert toast is not None and "Đăng nhập thất bại" in toast[0]
