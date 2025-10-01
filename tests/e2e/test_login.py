from __future__ import annotations

import pytest
from selenium.webdriver.support import expected_conditions as EC

from .pages.login import LoginPage
from .config import settings


@pytest.mark.usefixtures("logged_out_user")
@pytest.mark.selenium
class TestLogin:

    def test_login_success(self, driver, test_users):
        login_page = LoginPage(driver)
        login_page.load()

        creds = test_users["existing_user"]
        login_page.fill_form(email=creds["email"], password=creds["password"])
        login_page.submit()

        # Kiểm tra toast thành công
        toast = login_page.toast_message()
        assert toast is not None and "Đăng nhập" in toast[0]

        # Chờ đến khi URL chuyển sang /account
        login_page.wait.until(EC.url_contains("/account"))
        assert "/account" in driver.current_url

    def test_login_wrong_password(self, driver, test_users):
        login_page = LoginPage(driver)
        login_page.load()

        login_page.fill_form(
            email=test_users["existing_user"]["email"],
            password="wrong123"
        )
        login_page.submit()

        # Kiểm tra toast báo lỗi
        toast = login_page.toast_message()
        assert toast is not None and "Đăng nhập thất bại" in toast[0]

        # Chờ đảm bảo vẫn ở /login
        login_page.wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
