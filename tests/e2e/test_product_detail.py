from __future__ import annotations

import os
from typing import Any

import pytest

from .case_utils import build_case_params
from .pages.product_detail_page import ProductDetailPage
from .test_data import Case, PRODUCT_DETAIL_CASES


@pytest.fixture(scope="session")
def product_slug(pytestconfig: pytest.Config) -> str:
    slug = pytestconfig.getoption("--product-slug") or os.getenv("PYTEST_PRODUCT_SLUG")
    if not slug:
        pytest.skip("Cần truyền --product-slug hoặc đặt PYTEST_PRODUCT_SLUG để chạy e2e chi tiết sản phẩm.")
    return slug.strip("/")


def _open_product(page: ProductDetailPage, base_url: str, slug: str) -> None:
    page.open(base_url, slug)
    page.wait_until_ready()


def handle_detail_layout(*, case: Case, page: ProductDetailPage, base_url: str, product_slug: str, **_: Any) -> None:
    _open_product(page, base_url, product_slug)
    driver = page.driver
    assert driver.find_element(*ProductDetailPage.main_image).is_displayed(), f"{case.case_id}: Ảnh chính không hiển thị."
    assert driver.find_element(*ProductDetailPage.product_title).text.strip(), f"{case.case_id}: Tên sản phẩm trống."
    assert driver.find_element(*ProductDetailPage.price_label).text.strip(), f"{case.case_id}: Giá sản phẩm trống."
    assert driver.find_element(*ProductDetailPage.description_section).text.strip(), f"{case.case_id}: Thiếu mô tả."


def handle_detail_gallery_limit(*, case: Case, page: ProductDetailPage, base_url: str, product_slug: str, **_: Any) -> None:
    _open_product(page, base_url, product_slug)
    thumbnails = page.driver.find_elements(*ProductDetailPage.gallery_thumbnails)
    assert len(thumbnails) <= 5, f"{case.case_id}: Có {len(thumbnails)} ảnh phụ (>5)."


def handle_detail_price_format(*, case: Case, page: ProductDetailPage, base_url: str, product_slug: str, **_: Any) -> None:
    _open_product(page, base_url, product_slug)
    price = page.get_price_label()
    assert any(char.isdigit() for char in price) and ("đ" in price.lower() or "vnđ" in price.lower()), (
        f"{case.case_id}: Giá không đúng định dạng VNĐ ({price})."
    )


def handle_detail_add_to_cart(
    *,
    case: Case,
    page: ProductDetailPage,
    base_url: str,
    product_slug: str,
    wait,
    **_: Any,
) -> None:
    _open_product(page, base_url, product_slug)
    page.add_to_cart()
    message = page.get_toast_message()
    assert message and "giỏ" in message.lower(), f"{case.case_id}: Không có thông báo thêm giỏ ({message})."


def handle_detail_buy_now(
    *,
    case: Case,
    page: ProductDetailPage,
    base_url: str,
    product_slug: str,
    wait,
    driver,
    **_: Any,
) -> None:
    _open_product(page, base_url, product_slug)
    page.open_buy_now()
    wait.until(lambda drv: any(keyword in drv.current_url for keyword in ("checkout", "contact", "quote")))
    assert any(keyword in driver.current_url for keyword in ("checkout", "contact", "quote")), (
        f"{case.case_id}: Không điều hướng tới luồng đặt hàng ({driver.current_url})."
    )


def handle_detail_breadcrumb(*, case: Case, page: ProductDetailPage, base_url: str, product_slug: str, **_: Any) -> None:
    _open_product(page, base_url, product_slug)
    assert page.has_breadcrumb(), f"{case.case_id}: Không tìm thấy breadcrumb."


PRODUCT_DETAIL_CASE_CONFIG = {
    "TC_F04.1": {"handler": handle_detail_layout},
    "TC_F04.3": {"handler": handle_detail_gallery_limit},
    "TC_F04.6": {"handler": handle_detail_price_format},
    "TC_F04.13": {"handler": handle_detail_add_to_cart},
    "TC_F04.14": {"handler": handle_detail_buy_now},
    "TC_F04.25": {"handler": handle_detail_breadcrumb},
}


@pytest.mark.parametrize(("case", "handler"), build_case_params(PRODUCT_DETAIL_CASES, PRODUCT_DETAIL_CASE_CONFIG))
def test_product_detail_cases(
    case: Case,
    handler,
    driver,
    wait,
    base_url: str,
    product_slug: str,
) -> None:
    if handler is None:
        pytest.skip(f"Chưa tự động hóa {case.case_id}")
    page = ProductDetailPage(driver, wait)
    handler(case=case, page=page, driver=driver, wait=wait, base_url=base_url, product_slug=product_slug)
