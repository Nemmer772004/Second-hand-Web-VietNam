from __future__ import annotations

from urllib.parse import urljoin

from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


class RegisterPage:
    path = "/register"

    name_input = (By.CSS_SELECTOR, 'input[name="name"]')
    email_input = (By.CSS_SELECTOR, 'input[name="email"]')
    password_input = (By.CSS_SELECTOR, 'input[name="password"]')
    agree_checkbox = (By.CSS_SELECTOR, 'button[role="checkbox"]')
    submit_button = (By.CSS_SELECTOR, 'button[type="submit"]')
    login_link = (By.CSS_SELECTOR, 'a[href="/login"]')
    toast_container = (By.CSS_SELECTOR, '[data-state="open"][role="status"]')
    toast_title = (By.CSS_SELECTOR, '[data-state="open"] [role="status"] h3, [data-state="open"] h3')
    toast_description = (By.CSS_SELECTOR, '[data-state="open"] p')

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait = wait

    def open(self, base_url: str) -> None:
        target = urljoin(f"{base_url}/", self.path.lstrip("/"))
        self.driver.get(target)

    def wait_until_ready(self) -> None:
        self.wait.until(EC.visibility_of_element_located(self.name_input))

    def fill_form(
        self,
        name: str | None = None,
        email: str | None = None,
        password: str | None = None,
        agree: bool | None = None,
    ) -> None:
        if name is not None:
            field = self.driver.find_element(*self.name_input)
            field.clear()
            field.send_keys(name)

        if email is not None:
            field = self.driver.find_element(*self.email_input)
            field.clear()
            field.send_keys(email)

        if password is not None:
            field = self.driver.find_element(*self.password_input)
            field.clear()
            field.send_keys(password)

        if agree is not None:
            checkbox = self.driver.find_element(*self.agree_checkbox)
            is_checked = checkbox.get_attribute("data-state") == "checked"
            if agree != is_checked:
                checkbox.click()

    def submit(self) -> None:
        self.driver.find_element(*self.submit_button).click()

    def go_to_login(self) -> None:
        self.driver.find_element(*self.login_link).click()

    def is_checkbox_checked(self) -> bool:
        checkbox = self.driver.find_element(*self.agree_checkbox)
        return checkbox.get_attribute("data-state") == "checked"

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

    def get_validation_messages(self) -> list[str]:
        messages = []
        elements = self.driver.find_elements(By.CSS_SELECTOR, "[id$='-form-item-message']")
        for element in elements:
            text = element.text.strip()
            if text:
                messages.append(text)
        return messages
