from __future__ import annotations

import uuid
from typing import Any

from selenium.webdriver.common.by import By

import pytest

from .case_utils import build_case_params
from .pages.product_list_page import ProductListPage
from .test_data import Case, PRODUCT_LISTING_CASES


def _open_listing(page: ProductListPage, base_url: str) -> None:
    page.open(base_url)
    page.wait_until_ready()


def handle_listing_layout(*, case: Case, page: ProductListPage, base_url: str, **_: Any) -> None:
    _open_listing(page, base_url)
    driver = page.driver
    assert page.driver.find_elements(*ProductListPage.product_cards), f"{case.case_id}: Không tìm thấy sản phẩm nào."
    sidebar = driver.find_elements(By.TAG_NAME, "aside")
    assert sidebar and sidebar[0].is_displayed(), f"{case.case_id}: Sidebar bộ lọc không hiển thị."


def handle_listing_responsive(*, case: Case, page: ProductListPage, base_url: str, driver, **_: Any) -> None:
    driver.set_window_size(400, 900)
    _open_listing(page, base_url)
    max_width = driver.execute_script("return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);")
    viewport = driver.execute_script("return window.innerWidth;")
    assert max_width <= viewport + 4, f"{case.case_id}: Layout danh sách bị tràn ({max_width} > {viewport})."


def handle_listing_result_counter(*, case: Case, page: ProductListPage, base_url: str, **_: Any) -> None:
    _open_listing(page, base_url)
    counter = page.get_result_count_text()
    assert counter and "sản phẩm" in counter.lower(), f"{case.case_id}: Thiếu thông tin số lượng kết quả ({counter})."


def handle_listing_search_by_name(*, case: Case, page: ProductListPage, base_url: str, **_: Any) -> None:
    _open_listing(page, base_url)
    names = page.get_product_names()
    assert names, f"{case.case_id}: Không lấy được tên sản phẩm để tìm kiếm."
    keyword = names[0].split()[0]
    page.search(keyword)
    page.wait_for_results_update()
    filtered = page.get_product_names()
    assert filtered, f"{case.case_id}: Sau khi tìm kiếm {keyword!r} không có sản phẩm."
    assert all(keyword.lower() in name.lower() for name in filtered), (
        f"{case.case_id}: Kết quả không khớp keyword {keyword}: {filtered}"
    )


def handle_listing_search_no_result(*, case: Case, page: ProductListPage, base_url: str, **_: Any) -> None:
    _open_listing(page, base_url)
    keyword = f"no-result-{uuid.uuid4().hex[:6]}"
    page.search(keyword)
    page.wait_for_results_update()
    assert page.is_empty_state_visible(), f"{case.case_id}: Không hiển thị trạng thái rỗng khi tìm {keyword}."


def handle_listing_reset_filters(*, case: Case, page: ProductListPage, base_url: str, **_: Any) -> None:
    _open_listing(page, base_url)
    initial_names = page.get_product_names()
    assert initial_names, f"{case.case_id}: Không có sản phẩm gốc để so sánh."
    page.search("test")
    page.wait_for_results_update()
    page.click_reset_filters()
    page.wait_for_results_update()
    after_reset = page.get_product_names()
    assert after_reset, f"{case.case_id}: Sau reset filter không có sản phẩm."
    assert len(after_reset) >= len(initial_names) or set(after_reset) == set(initial_names), (
        f"{case.case_id}: Reset filter không trả về danh sách ban đầu."
    )


def handle_listing_url_query(*, case: Case, page: ProductListPage, base_url: str, driver, **_: Any) -> None:
    _open_listing(page, base_url)
    page.search("query")
    page.wait_for_results_update()
    assert "?q=" in driver.current_url or "?search=" in driver.current_url, (
        f"{case.case_id}: URL không lưu query tìm kiếm ({driver.current_url})."
    )


PRODUCT_LISTING_CASE_CONFIG = {
    "TC_F03.1": {"handler": handle_listing_layout},
    "TC_F03.6": {"handler": handle_listing_responsive},
    "TC_F03.12": {"handler": handle_listing_result_counter},
    "TC_F03.22": {"handler": handle_listing_reset_filters},
    "TC_F03.23": {"handler": handle_listing_url_query},
    "TC_F03.25": {"handler": handle_listing_search_by_name},
    "TC_F03.26": {"handler": handle_listing_search_no_result},
}


@pytest.mark.parametrize(("case", "handler"), build_case_params(PRODUCT_LISTING_CASES, PRODUCT_LISTING_CASE_CONFIG))
def test_product_listing_cases(case: Case, handler, driver, wait, base_url: str) -> None:
    if handler is None:
        pytest.skip(f"Chưa tự động hóa {case.case_id}")
    page = ProductListPage(driver, wait)
    handler(case=case, page=page, driver=driver, wait=wait, base_url=base_url)
