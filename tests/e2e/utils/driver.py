"""Utilities for creating Selenium WebDriver instances."""
from __future__ import annotations

import contextlib
from typing import Iterator

from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.firefox.options import Options as FirefoxOptions

from ..config import settings


def _create_chrome() -> webdriver.Remote:
    opts = ChromeOptions()
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--window-size=1440,900")
    if settings.remote_webdriver_url:
        opts.set_capability("se:recordVideo", False)
        return webdriver.Remote(
            command_executor=settings.remote_webdriver_url,
            options=opts,
        )
    return webdriver.Chrome(options=opts)


def _create_firefox() -> webdriver.Remote:
    opts = FirefoxOptions()
    opts.add_argument("-width=1440")
    opts.add_argument("-height=900")
    if settings.remote_webdriver_url:
        return webdriver.Remote(
            command_executor=settings.remote_webdriver_url,
            options=opts,
            desired_capabilities=DesiredCapabilities.FIREFOX.copy(),
        )
    return webdriver.Firefox(options=opts)


def create_driver() -> webdriver.Remote:
    """Instantiate a WebDriver based on configuration."""
    browser = settings.browser
    if browser == "chrome":
        driver = _create_chrome()
    elif browser == "firefox":
        driver = _create_firefox()
    else:
        raise ValueError(f"Unsupported browser: {browser}")

    driver.implicitly_wait(settings.implicit_wait)
    return driver


@contextlib.contextmanager
def managed_driver() -> Iterator[webdriver.Remote]:
    driver = create_driver()
    try:
        yield driver
    finally:
        with contextlib.suppress(Exception):
            driver.quit()
