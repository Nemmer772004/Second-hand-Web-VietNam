from __future__ import annotations

import time
import uuid
from typing import Any

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

import pytest

from .case_utils import build_case_params
from .pages.login_page import LoginPage
from .test_data import Case, LOGIN_CASES


def _open_login(page: LoginPage, base_url: str) -> None:
    page.open(base_url)
    page.wait_until_ready()


def _reset_session(driver) -> None:
    driver.delete_all_cookies()


def _expect_toast_contains(page: LoginPage, keyword: str) -> None:
    title, description = page.get_toast()
    combined = " ".join(filter(None, (title, description))).lower()
    assert keyword.lower() in combined, f"Thông báo không chứa '{keyword}': {combined}"


def handle_login_form_layout(*, case: Case, page: LoginPage, base_url: str, **_: Any) -> None:
    _open_login(page, base_url)
    for locator in (LoginPage.email_input, LoginPage.password_input, LoginPage.submit_button):
        element = page.driver.find_element(*locator)
        assert element.is_displayed(), f"{case.case_id}: Trường {locator} không hiển thị."


def handle_login_placeholders(*, case: Case, page: LoginPage, base_url: str, **_: Any) -> None:
    _open_login(page, base_url)
    driver = page.driver
    labels = {
        "email": "Email",
        "password": "Mật khẩu",
    }
    for field, expected in labels.items():
        label = driver.find_element(By.CSS_SELECTOR, f"label[for='{field}']")
        assert label.text.strip() == expected, f"{case.case_id}: Label {field} khác mong đợi ({label.text!r})."
    placeholders = {
        LoginPage.email_input: "ban@example.com",
        LoginPage.password_input: "••••",
    }
    for locator, expected in placeholders.items():
        placeholder = driver.find_element(*locator).get_attribute("placeholder") or ""
        assert expected.strip("•") in placeholder, f"{case.case_id}: Placeholder {placeholder!r} thiếu {expected!r}"


def handle_login_empty_errors(*, case: Case, page: LoginPage, base_url: str, **_: Any) -> None:
    _open_login(page, base_url)
    page.submit()
    messages = page.get_validation_messages()
    assert messages, f"{case.case_id}: Không xuất hiện thông báo bắt buộc."


def handle_login_responsive(*, case: Case, page: LoginPage, base_url: str, driver, **_: Any) -> None:
    driver.set_window_size(400, 900)
    _open_login(page, base_url)
    max_width = driver.execute_script("return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);")
    viewport = driver.execute_script("return window.innerWidth;")
    assert max_width <= viewport + 4, f"{case.case_id}: Layout bị tràn ({max_width} > {viewport})."


def handle_login_register_link(*, case: Case, page: LoginPage, base_url: str, wait, **_: Any) -> None:
    _open_login(page, base_url)
    page.go_to_register()
    wait.until(EC.url_contains("/register"))
    assert "/register" in page.driver.current_url, f"{case.case_id}: Chưa điều hướng tới /register."


def handle_login_valid(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    wait,
    valid_login_user: dict[str, str],
    driver,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    page.fill_credentials(email=valid_login_user["email"], password=valid_login_user["password"])
    page.submit()
    wait.until(EC.url_contains("/account"))
    _reset_session(driver)


def handle_login_wrong_password(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    wait,
    valid_login_user: dict[str, str],
    driver,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    page.fill_credentials(email=valid_login_user["email"], password="SaiMatKhau123!")
    page.submit()
    time.sleep(0.2)
    _expect_toast_contains(page, "sai")
    _reset_session(driver)


def handle_login_unknown_email(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    unknown_email = f"unknown_{uuid.uuid4().hex[:6]}@test-suite.local"
    page.fill_credentials(email=unknown_email, password="Test@1234")
    page.submit()
    _expect_toast_contains(page, "không tồn tại")


def handle_login_invalid_email(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    page.fill_credentials(email="nam@", password="Test@1234")
    page.submit()
    messages = page.get_validation_messages()
    assert any("email không hợp lệ" in message.lower() for message in messages), (
        f"{case.case_id}: Không thấy thông báo email không hợp lệ ({messages})."
    )


def handle_login_trim_whitespace(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    wait,
    valid_login_user: dict[str, str],
    driver,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    page.fill_credentials(email=f"  {valid_login_user['email']}  ", password=valid_login_user["password"])
    page.submit()
    wait.until(EC.url_contains("/account"))
    _reset_session(driver)


def handle_login_case_insensitive(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    wait,
    valid_login_user: dict[str, str],
    driver,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    page.fill_credentials(email=valid_login_user["email"].upper(), password=valid_login_user["password"])
    page.submit()
    wait.until(EC.url_contains("/account"))
    _reset_session(driver)


def handle_login_response_time(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    wait,
    valid_login_user: dict[str, str],
    driver,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    page.fill_credentials(email=valid_login_user["email"], password=valid_login_user["password"])
    start = time.perf_counter()
    page.submit()
    wait.until(EC.url_contains("/account"))
    duration = time.perf_counter() - start
    assert duration < 2.0, f"{case.case_id}: Đăng nhập mất {duration:.2f}s (>2s)."
    _reset_session(driver)


def handle_login_autofocus(*, case: Case, page: LoginPage, base_url: str, **_: Any) -> None:
    _open_login(page, base_url)
    assert page.is_email_autofocused(), f"{case.case_id}: Ô email không được focus tự động."


def handle_login_sql_injection(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    page.fill_credentials(email="' OR 1=1 --", password="anything")
    page.submit()
    _expect_toast_contains(page, "không")


def handle_login_xss_input(
    *,
    case: Case,
    page: LoginPage,
    base_url: str,
    **_: Any,
) -> None:
    _open_login(page, base_url)
    payload = "<script>alert(1)</script>"
    page.fill_credentials(email=payload, password="Test@1234")
    page.submit()
    messages = page.get_validation_messages()
    assert messages, f"{case.case_id}: Không có thông báo validate khi nhập script."


LOGIN_CASE_CONFIG = {
    "TC_F02.1": {"handler": handle_login_form_layout},
    "TC_F02.2": {"handler": handle_login_placeholders},
    "TC_F02.3": {"handler": handle_login_empty_errors},
    "TC_F02.4": {"handler": handle_login_responsive},
    "TC_F02.7": {"handler": handle_login_register_link},
    "TC_F02.9": {"handler": handle_login_valid},
    "TC_F02.10": {"handler": handle_login_wrong_password},
    "TC_F02.11": {"handler": handle_login_unknown_email},
    "TC_F02.12": {"handler": handle_login_invalid_email},
    "TC_F02.15": {"handler": handle_login_trim_whitespace},
    "TC_F02.16": {"handler": handle_login_case_insensitive},
    "TC_F02.17": {"handler": handle_login_response_time},
    "TC_F02.27": {"handler": handle_login_autofocus},
    "TC_F02.28": {"handler": handle_login_sql_injection},
    "TC_F02.29": {"handler": handle_login_xss_input},
}


@pytest.mark.parametrize(("case", "handler"), build_case_params(LOGIN_CASES, LOGIN_CASE_CONFIG))
def test_login_cases(
    case: Case,
    handler,
    driver,
    wait,
    base_url: str,
    valid_login_user: dict[str, str],
) -> None:
    if handler is None:
        pytest.skip(f"Chưa tự động hóa {case.case_id}")
    page = LoginPage(driver, wait)
    handler(
        case=case,
        page=page,
        driver=driver,
        wait=wait,
        base_url=base_url,
        valid_login_user=valid_login_user,
    )
