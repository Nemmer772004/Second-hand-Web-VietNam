"""Helpers for generating dynamic test data."""
from __future__ import annotations

import random
import string
from dataclasses import dataclass


def random_suffix(length: int = 6) -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


def unique_email(prefix: str = "testuser", domain: str = "example.com") -> str:
    return f"{prefix}.{random_suffix()}@{domain}"


@dataclass(slots=True)
class CheckoutData:
    receiver: str = "Nguyễn Văn B"
    address: str = "123 Nguyễn Trãi, P5, Q5, TP.HCM"
    phone: str = "0901234567"
    note: str = "Giao giờ hành chính"
