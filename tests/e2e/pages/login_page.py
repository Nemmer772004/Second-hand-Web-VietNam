from __future__ import annotations

from urllib.parse import urljoin

from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


class LoginPage:
    path = "/login"

    email_input = (By.CSS_SELECTOR, 'input[name="email"]')
    password_input = (By.CSS_SELECTOR, 'input[name="password"]')
    submit_button = (By.CSS_SELECTOR, 'button[type="submit"]')
    register_link = (By.CSS_SELECTOR, 'a[href="/register"]')
    forgot_password_link = (By.PARTIAL_LINK_TEXT, "Quên mật khẩu")
    remember_me_checkbox = (By.CSS_SELECTOR, 'input[type="checkbox"][name*="remember"]')
    password_toggle_button = (By.CSS_SELECTOR, '[data-testid="password-visibility-toggle"], button[aria-label*="mật khẩu"]')
    toast_container = (By.CSS_SELECTOR, '[data-state="open"][role="status"]')
    toast_title = (By.CSS_SELECTOR, '[data-state="open"] h3')
    toast_description = (By.CSS_SELECTOR, '[data-state="open"] p')

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait = wait

    def open(self, base_url: str) -> None:
        target = urljoin(f"{base_url}/", self.path.lstrip("/"))
        self.driver.get(target)

    def wait_until_ready(self) -> None:
        self.wait.until(EC.visibility_of_element_located(self.email_input))
        self.wait.until(EC.visibility_of_element_located(self.password_input))

    def fill_credentials(self, email: str | None = None, password: str | None = None) -> None:
        if email is not None:
            field = self.wait.until(EC.element_to_be_clickable(self.email_input))
            field.clear()
            field.send_keys(email)

        if password is not None:
            field = self.wait.until(EC.element_to_be_clickable(self.password_input))
            field.clear()
            field.send_keys(password)

    def submit(self) -> None:
        button = self.wait.until(EC.element_to_be_clickable(self.submit_button))
        button.click()

    def go_to_register(self) -> None:
        self.wait.until(EC.element_to_be_clickable(self.register_link)).click()

    def go_to_forgot_password(self) -> None:
        self.wait.until(EC.element_to_be_clickable(self.forgot_password_link)).click()

    def toggle_password_visibility(self) -> None:
        self.wait.until(EC.element_to_be_clickable(self.password_toggle_button)).click()

    def toggle_remember_me(self) -> None:
        self.wait.until(EC.element_to_be_clickable(self.remember_me_checkbox)).click()

    def get_validation_messages(self) -> list[str]:
        messages = []
        elements = self.driver.find_elements(By.CSS_SELECTOR, "[id$='-form-item-message']")
        for element in elements:
            text = element.text.strip()
            if text:
                messages.append(text)
        return messages

    def get_toast(self) -> tuple[str | None, str | None]:
        try:
            self.wait.until(EC.visibility_of_element_located(self.toast_container))
        except TimeoutException:
            return (None, None)

        title = None
        description = None

        try:
            title = self.driver.find_element(*self.toast_title).text.strip()
        except NoSuchElementException:
            title = None

        try:
            description = self.driver.find_element(*self.toast_description).text.strip()
        except NoSuchElementException:
            description = None

        return (title or None, description or None)

    def is_email_autofocused(self) -> bool:
        active = self.driver.switch_to.active_element
        try:
            email_element = self.driver.find_element(*self.email_input)
        except NoSuchElementException:
            return False
        return active == email_element
