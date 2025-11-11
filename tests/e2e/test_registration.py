from __future__ import annotations

import time
import uuid
from typing import Any

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

import pytest

from .case_utils import build_case_params
from .pages.register_page import RegisterPage
from .test_data import Case, REGISTRATION_CASES


def _open_registration(page: RegisterPage, base_url: str) -> None:
    page.open(base_url)
    page.wait_until_ready()


def _assert_validation_contains(page: RegisterPage, expected: str) -> None:
    messages = page.get_validation_messages()
    assert any(expected.lower() in message.lower() for message in messages), (
        f"Không tìm thấy thông báo chứa '{expected}'. Các thông báo hiện có: {messages}"
    )


def _reset_session(driver) -> None:
    driver.delete_all_cookies()


def handle_registration_form_layout(*, case: Case, page: RegisterPage, base_url: str, **_: Any) -> None:
    _open_registration(page, base_url)
    driver = page.driver
    for locator in (
        RegisterPage.name_input,
        RegisterPage.email_input,
        RegisterPage.password_input,
        RegisterPage.submit_button,
        RegisterPage.agree_checkbox,
    ):
        element = driver.find_element(*locator)
        assert element.is_displayed(), f"{case.case_id}: Trường {locator} không hiển thị."


def handle_registration_labels_placeholders(*, case: Case, page: RegisterPage, base_url: str, **_: Any) -> None:
    _open_registration(page, base_url)
    driver = page.driver
    expected_labels = {
        "name": "Họ và Tên",
        "email": "Email",
        "password": "Mật khẩu",
    }
    for field, expected_label in expected_labels.items():
        label = driver.find_element(By.CSS_SELECTOR, f"label[for='{field}']")
        assert (
            label.text.strip() == expected_label
        ), f"{case.case_id}: Label {field} khác mong đợi ({label.text!r} != {expected_label!r})."

    placeholder_expectations = {
        RegisterPage.name_input: "Nguyễn Văn A",
        RegisterPage.email_input: "ban@example.com",
        RegisterPage.password_input: "••••",
    }
    for locator, expected_placeholder in placeholder_expectations.items():
        placeholder = driver.find_element(*locator).get_attribute("placeholder") or ""
        assert expected_placeholder.strip("•") in placeholder, (
            f"{case.case_id}: Placeholder {locator} ({placeholder!r}) không chứa {expected_placeholder!r}."
        )


def handle_registration_responsive(*, case: Case, page: RegisterPage, base_url: str, driver, **_: Any) -> None:
    driver.set_window_size(400, 900)
    _open_registration(page, base_url)
    max_width = driver.execute_script("return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);")
    viewport = driver.execute_script("return window.innerWidth;")
    assert max_width <= viewport + 4, f"{case.case_id}: Layout bị tràn ngang ({max_width} > {viewport})."


def handle_registration_login_link(*, case: Case, page: RegisterPage, base_url: str, wait, **_: Any) -> None:
    _open_registration(page, base_url)
    page.go_to_login()
    wait.until(EC.url_contains("/login"))
    assert "/login" in page.driver.current_url, f"{case.case_id}: Chưa điều hướng tới /login."


def handle_registration_no_horizontal_scroll(*, case: Case, page: RegisterPage, base_url: str, driver, **_: Any) -> None:
    driver.set_window_size(1366, 900)
    _open_registration(page, base_url)
    max_width = driver.execute_script("return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);")
    viewport = driver.execute_script("return window.innerWidth;")
    assert max_width <= viewport + 4, f"{case.case_id}: Có thanh cuộn ngang ({max_width} > {viewport})."


def handle_registration_valid_registration(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    wait,
    unique_email: str,
    driver,
    **_: Any,
) -> None:
    _open_registration(page, base_url)
    page.fill_form(name="Người Dùng Tự Động", email=unique_email, password="Test@1234", agree=True)
    page.submit()
    wait.until(EC.url_contains("/account"))
    message = page.get_toast()
    assert any("tài khoản" in (text or "").lower() for text in message), f"{case.case_id}: Toast không thông báo thành công ({message})."
    _reset_session(driver)


def handle_registration_duplicate_email(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    wait,
    ensure_user,
    driver,
    **_: Any,
) -> None:
    existing_email = f"dup_{uuid.uuid4().hex[:6]}@test-suite.local"
    ensure_user(existing_email, "Test@1234", "Người Dùng Có Sẵn")
    _open_registration(page, base_url)
    page.fill_form(name="Người Dùng Có Sẵn", email=existing_email, password="Test@1234", agree=True)
    page.submit()
    time.sleep(0.2)
    toast = page.get_toast()
    assert any("đã được sử dụng" in (text or "").lower() for text in toast), (
        f"{case.case_id}: Không thấy thông báo email trùng. Toast={toast}"
    )
    _reset_session(driver)


def handle_registration_invalid_email(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    **_: Any,
) -> None:
    _open_registration(page, base_url)
    page.fill_form(name="Người Dùng", email="namnam@", password="Test@1234", agree=True)
    page.submit()
    _assert_validation_contains(page, "địa chỉ email hợp lệ")


def handle_registration_short_password(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    **_: Any,
) -> None:
    _open_registration(page, base_url)
    page.fill_form(name="Người Dùng", email="shortpass@test-suite.local", password="123", agree=True)
    page.submit()
    _assert_validation_contains(page, "ít nhất 8 ký tự")


def handle_registration_email_whitespace(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    wait,
    driver,
    **_: Any,
) -> None:
    email = f"   trim_{uuid.uuid4().hex[:6]}@test-suite.local   "
    _open_registration(page, base_url)
    page.fill_form(name="Trim Email", email=email, password="Test@1234", agree=True)
    page.submit()
    wait.until(EC.url_contains("/account"))
    _reset_session(driver)


def handle_registration_email_uppercase(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    wait,
    driver,
    **_: Any,
) -> None:
    email = f"Upper_{uuid.uuid4().hex[:6]}@Test-Suite.Local".upper()
    _open_registration(page, base_url)
    page.fill_form(name="Email Hoa", email=email, password="Test@1234", agree=True)
    page.submit()
    wait.until(EC.url_contains("/account"))
    _reset_session(driver)


def handle_registration_terms_unchecked(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    **_: Any,
) -> None:
    _open_registration(page, base_url)
    page.fill_form(name="Thiếu Điều Khoản", email="missing_terms@test-suite.local", password="Test@1234", agree=False)
    page.submit()
    _assert_validation_contains(page, "Bạn phải đồng ý")


def handle_registration_response_time(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    wait,
    driver,
    **_: Any,
) -> None:
    email = f"timer_{uuid.uuid4().hex[:6]}@test-suite.local"
    _open_registration(page, base_url)
    page.fill_form(name="Đo Thời Gian", email=email, password="Test@1234", agree=True)
    start = time.perf_counter()
    page.submit()
    wait.until(EC.url_contains("/account"))
    elapsed = time.perf_counter() - start
    assert elapsed < 2.0, f"{case.case_id}: Phản hồi chậm {elapsed:.2f}s"
    _reset_session(driver)


def handle_registration_empty_form(
    *,
    case: Case,
    page: RegisterPage,
    base_url: str,
    **_: Any,
) -> None:
    _open_registration(page, base_url)
    page.submit()
    messages = page.get_validation_messages()
    assert messages, f"{case.case_id}: Không hiển thị thông báo bắt buộc khi form trống."


REGISTRATION_CASE_CONFIG = {
    "TC_F01.1": {"handler": handle_registration_form_layout},
    "TC_F01.2": {"handler": handle_registration_labels_placeholders},
    "TC_F01.4": {"handler": handle_registration_responsive},
    "TC_F01.8": {"handler": handle_registration_login_link},
    "TC_F01.9": {"handler": handle_registration_no_horizontal_scroll},
    "TC_F01.11": {"handler": handle_registration_valid_registration},
    "TC_F01.12": {"handler": handle_registration_duplicate_email},
    "TC_F01.13": {"handler": handle_registration_invalid_email},
    "TC_F01.14": {"handler": handle_registration_short_password},
    "TC_F01.17": {"handler": handle_registration_email_whitespace},
    "TC_F01.18": {"handler": handle_registration_email_uppercase},
    "TC_F01.22": {"handler": handle_registration_terms_unchecked},
    "TC_F01.23": {"handler": handle_registration_response_time, "xfail_strict": True},
    "TC_F01.28": {"handler": handle_registration_empty_form},
}


@pytest.mark.parametrize(("case", "handler"), build_case_params(REGISTRATION_CASES, REGISTRATION_CASE_CONFIG))
def test_registration_cases(
    case: Case,
    handler,
    driver,
    wait,
    base_url: str,
    ensure_user,
    unique_email: str,
) -> None:
    if handler is None:
        pytest.skip(f"Chưa tự động hóa {case.case_id}")
    page = RegisterPage(driver, wait)
    handler(
        case=case,
        page=page,
        driver=driver,
        wait=wait,
        base_url=base_url,
        ensure_user=ensure_user,
        unique_email=unique_email,
    )
