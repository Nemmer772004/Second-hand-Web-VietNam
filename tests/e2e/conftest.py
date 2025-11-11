import os
import time
import uuid
from typing import Callable
import types

import pytest
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--base-url",
        action="store",
        default=os.getenv("FRONTEND_BASE_URL", "http://localhost:9002"),
        help="Địa chỉ frontend để chạy e2e (mặc định http://localhost:9002).",
    )
    parser.addoption(
        "--api-url",
        action="store",
        default=os.getenv("API_GATEWAY_URL", "http://localhost:4000"),
        help="Gateway/API base cho các lời gọi hỗ trợ test.",
    )
    parser.addoption(
        "--selenium-remote",
        action="store",
        default=os.getenv("SELENIUM_REMOTE_URL"),
        help="URL của Selenium Grid. Nếu bỏ trống sẽ mở Chrome nội bộ.",
    )
    parser.addoption(
        "--headed",
        action="store_true",
        default=False,
        help="Chạy trình duyệt ở chế độ headed (mặc định headless).",
    )
    parser.addoption(
        "--keep-browser",
        action="store_true",
        default=False,
        help="Giữ cửa sổ trình duyệt mở sau khi test kết thúc để quan sát.",
    )
    parser.addoption(
        "--slow-mo",
        action="store",
        type=float,
        default=float(os.getenv("PYTEST_SLOW_MO", "0")),
        help="Độ trễ (giây) sau mỗi thao tác WebDriver để dễ quan sát.",
    )
    parser.addoption(
        "--product-slug",
        action="store",
        default=os.getenv("PYTEST_PRODUCT_SLUG"),
        help="Slug sản phẩm cố định để tái sử dụng trong các bài test.",
    )


def pytest_configure(config: pytest.Config) -> None:
    slug = config.getoption("--product-slug")
    if slug:
        os.environ["PYTEST_PRODUCT_SLUG"] = slug
    elif "PYTEST_PRODUCT_SLUG" in os.environ:
        os.environ.pop("PYTEST_PRODUCT_SLUG")
    slow_mo = config.getoption("--slow-mo")
    os.environ["PYTEST_SLOW_MO"] = str(slow_mo)


@pytest.fixture(scope="session")
def base_url(pytestconfig: pytest.Config) -> str:
    return pytestconfig.getoption("--base-url").rstrip("/")


@pytest.fixture(scope="session")
def api_url(pytestconfig: pytest.Config) -> str:
    return pytestconfig.getoption("--api-url").rstrip("/")


@pytest.fixture
def driver(pytestconfig: pytest.Config):
    remote = pytestconfig.getoption("--selenium-remote")
    headed = pytestconfig.getoption("--headed")
    keep_browser = pytestconfig.getoption("--keep-browser")
    slow_mo = pytestconfig.getoption("--slow-mo")
    if (slow_mo is None or slow_mo <= 0) and headed:
        slow_mo = 0.5
        os.environ["PYTEST_SLOW_MO"] = "0.5"

    options = Options()
    if not headed:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1366,900")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")

    if remote:
        driver_instance = webdriver.Remote(command_executor=remote, options=options)
    else:
        driver_instance = webdriver.Chrome(options=options)

    driver_instance.set_window_size(1366, 900)

    if slow_mo and slow_mo > 0:
        original_execute = driver_instance.execute

        def execute_with_delay(self, command, params=None):
            result = original_execute(command, params)
            time.sleep(slow_mo)
            return result

        driver_instance.execute = types.MethodType(execute_with_delay, driver_instance)

    yield driver_instance
    if keep_browser:
        try:
            input("Đã bật --keep-browser, nhấn Enter để đóng Chrome...")
        except EOFError:
            pass
    driver_instance.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, timeout=10)


@pytest.fixture
def unique_email():
    suffix = uuid.uuid4().hex[:6]
    return f"auto_user_{suffix}@test-suite.local"


def _register_user(api_url: str, email: str, password: str, name: str) -> None:
    base = api_url.rstrip("/")
    fallback_base = base
    if not base.endswith("/api"):
        fallback_base = f"{base}/api"

    endpoints = [
        f"{base}/auth/register",
        f"{fallback_base}/auth/register",
    ]
    endpoints = list(dict.fromkeys(endpoints))

    payload = {"email": email, "password": password, "name": name}
    errors = []

    for endpoint in endpoints:
        try:
            response = requests.post(endpoint, json=payload, timeout=10)
        except requests.RequestException as exc:  # pragma: no cover
            errors.append(f"{endpoint} -> {exc}")
            continue
        if response.status_code in (200, 201, 409):
            return
        errors.append(f"{endpoint} -> {response.status_code} {response.text}")

    details = "; ".join(errors) if errors else "Không rõ nguyên nhân"
    raise AssertionError(f"Không thể khởi tạo user phục vụ test {email}: {details}")


@pytest.fixture(scope="session")
def ensure_user(api_url: str) -> Callable[[str, str, str], None]:
    def _ensure(email: str, password: str, name: str) -> None:
        _register_user(api_url, email, password, name)
    return _ensure


@pytest.fixture(scope="session")
def valid_login_user(api_url: str):
    email = f"login_user_{uuid.uuid4().hex[:6]}@test-suite.local"
    password = "Test@1234"
    name = "Người Dùng Thử"
    _register_user(api_url, email, password, name)
    return {"email": email, "password": password, "name": name}
