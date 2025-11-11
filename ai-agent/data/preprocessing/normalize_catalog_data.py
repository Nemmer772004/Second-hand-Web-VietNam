#!/usr/bin/env python3

from __future__ import annotations

import csv
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import quote_plus

BASE_DIR = Path(__file__).resolve().parents[2]
RAW_DIR = BASE_DIR / "data" / "raw"
OUTPUT_DIR = BASE_DIR / "data" / "processed"

PRODUCTS_SOURCE = RAW_DIR / "products.csv"
REVIEWS_SOURCE = RAW_DIR / "reviews.csv"
PRODUCTS_TARGET = OUTPUT_DIR / "products_normalized.jsonl"
REVIEWS_TARGET = OUTPUT_DIR / "reviews_normalized.jsonl"
PRODUCTS_MONGO_TARGET = OUTPUT_DIR / "products_mongo.jsonl"
REVIEWS_MONGO_TARGET = OUTPUT_DIR / "reviews_mongo.jsonl"
DEFAULT_SELLER_OID = os.environ.get("DEFAULT_SELLER_OID", "000000000000000000000001")
DEFAULT_USER_OID = os.environ.get("DEFAULT_USER_OID", "000000000000000000000002")
OID_PATTERN = re.compile(r"^[0-9a-fA-F]{24}$")

# Ảnh đại diện cho 10 sản phẩm đầu tiên (sử dụng nguồn Unsplash)
PRODUCT_IMAGE_MAP: Dict[int, List[str]] = {
    1: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=800&q=80",
    ],
    2: [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    ],
    3: [
        "https://images.unsplash.com/photo-1523289333742-be1143f6b766?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=800&q=80",
    ],
    4: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
    ],
    5: [
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
    ],
    6: [
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
    ],
    7: [
        "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1439736637365-748f240b24fb?auto=format&fit=crop&w=800&q=80",
    ],
    8: [
        "https://images.unsplash.com/photo-1500694470414-45d4d1c17384?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    ],
    9: [
        "https://images.unsplash.com/photo-1523419409543-0c1df022bdd9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=800&q=80",
    ],
    10: [
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80",
    ],
}
PLACEHOLDER_IMAGE_TEMPLATE = "https://placehold.co/960x640?text={label}"


def parse_price_range(value: str) -> Tuple[Optional[int], Optional[int], Optional[str]]:
    text = value.strip()
    if not text:
        return None, None, None

    currency = "VND" if "₫" in text else None
    parts = [segment.strip() for segment in text.split("-") if segment.strip()]
    numeric_values: List[int] = []
    for part in parts:
        digits = re.sub(r"[^\d]", "", part)
        if digits:
            numeric_values.append(int(digits))

    if not numeric_values:
        return None, None, currency

    if len(numeric_values) == 1:
        price = numeric_values[0]
        return price, price, currency

    return min(numeric_values), max(numeric_values), currency


def parse_quantity(value: str) -> Optional[int]:
    text = value.strip().lower()
    if not text:
        return None

    text = text.replace(".", "").replace(",", ".")
    if text.endswith("+"):
        text = text[:-1]

    match = re.match(r"([0-9]+(?:\.[0-9]+)?)([a-z]*)", text)
    if not match:
        return None

    number = float(match.group(1))
    suffix = match.group(2)

    if suffix == "k":
        number *= 1_000
    elif suffix == "m":
        number *= 1_000_000
    elif suffix:
        return None

    return int(round(number))


def parse_stock(value: str) -> Tuple[Optional[str], Optional[int]]:
    text = value.strip()
    if not text:
        return "unknown", None

    if text.isdigit():
        qty = int(text)
        status = "in_stock" if qty > 0 else "out_of_stock"
        return status, qty

    normalized = text.upper()
    if normalized == "CÒN HÀNG":
        return "in_stock", None
    if normalized in {"HẾT HÀNG", "OUT OF STOCK"}:
        return "out_of_stock", None
    return "unknown", None


def parse_datetime(value: str) -> Optional[str]:
    text = value.strip()
    if not text:
        return None

    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
        try:
            dt = datetime.strptime(text, fmt)
            return dt.isoformat(timespec="seconds")
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(text).isoformat(timespec="seconds")
    except ValueError:
        return None


def parse_variation(value: str) -> Optional[Dict[str, Any]]:
    text = value.strip()
    if not text:
        return None

    parts = [segment.strip() for segment in value.split("|") if segment.strip()]
    payload: Dict[str, Any] = {}
    attributes: Dict[str, Any] = {}

    for part in parts:
        if ":" in part:
            key, raw = part.split(":", 1)
            values = [item.strip() for item in raw.split(",") if item.strip()]
            if not values:
                continue
            attributes[key.strip()] = values if len(values) > 1 else values[0]
        else:
            if part.isdigit():
                payload["optionId"] = int(part)
            else:
                payload.setdefault("labels", []).append(part)

    if attributes:
        payload["attributes"] = attributes

    return payload or None


def parse_images(value: str) -> List[str]:
    candidates = [segment.strip() for segment in value.split("|")]
    return [candidate for candidate in candidates if candidate]


def to_int(value: str) -> Optional[int]:
    text = value.strip()
    if not text:
        return None
    if text.isdigit():
        return int(text)
    return None


def to_float(value: str) -> Optional[float]:
    text = value.strip().replace(",", ".")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def to_decimal_document(value: int) -> Dict[str, str]:
    return {"$numberDecimal": str(value)}


def ensure_oid(value: str, *, name: str) -> str:
    if not OID_PATTERN.match(value):
        raise ValueError(
            f"{name} phải là chuỗi 24 ký tự hex hợp lệ (nhận được: {value!r})"
        )
    return value.lower()


def oid_document(value: str) -> Dict[str, str]:
    return {"$oid": value}


def oid_from_int(identifier: int) -> str:
    if identifier < 0:
        raise ValueError("identifier phải là số nguyên dương")
    return f"{identifier:024x}"


def write_ndjson(target: Path, records: Iterable[Dict[str, Any]]) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", encoding="utf-8") as handle:
        for record in records:
            json.dump(record, handle, ensure_ascii=False)
            handle.write("\n")


def normalize_products() -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    normalized: List[Dict[str, Any]] = []
    mongo_ready: List[Dict[str, Any]] = []
    seller_oid_value = ensure_oid(DEFAULT_SELLER_OID, name="DEFAULT_SELLER_OID")
    with PRODUCTS_SOURCE.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row_index, row in enumerate(reader, start=2):
            product_id = to_int(row.get("product_id", ""))
            if product_id is None:
                continue
            product_oid_value = oid_from_int(product_id)

            price_min, price_max, currency = parse_price_range(row.get("price", ""))
            sold_count = parse_quantity(row.get("sold_count", ""))
            review_count = parse_quantity(row.get("num_reviews", ""))
            average_rating = to_float(row.get("average_rating", ""))
            stock_status, stock_qty = parse_stock(row.get("stock", ""))
            name = row.get("name", "").strip()
            brand = row.get("brand", "").strip() or None
            short_description = (row.get("short_description", "") or "").strip()
            if product_id in PRODUCT_IMAGE_MAP:
                images = PRODUCT_IMAGE_MAP[product_id]
            else:
                label = quote_plus(f"Product {product_id}")
                placeholder = PLACEHOLDER_IMAGE_TEMPLATE.format(label=label)
                images = [placeholder]
            primary_image = images[0] if images else None

            normalized_payload: Dict[str, Any] = {
                "_id": product_id,
                "productId": product_id,
                "name": name or None,
                "brand": brand,
                "shortDescription": short_description or None,
                "pricing": {
                    "min": price_min,
                    "max": price_max,
                    "currency": currency,
                    "raw": row.get("price", "").strip() or None,
                },
                "metrics": {
                    "soldCount": sold_count,
                    "averageRating": average_rating,
                    "reviewCount": review_count,
                },
                "inventory": {
                    "status": stock_status,
                    "quantity": stock_qty,
                    "raw": row.get("stock", "").strip() or None,
                },
                "source": {
                    "file": PRODUCTS_SOURCE.name,
                    "rowNumber": row_index,
                },
            }

            if images:
                normalized_payload["images"] = images
                normalized_payload["primaryImage"] = primary_image

            normalized.append(normalized_payload)

            price_value = price_min if price_min is not None else price_max
            description = short_description or name or f"Sản phẩm {product_id}"
            sold_value = sold_count if sold_count is not None else 0
            rating_value = average_rating if average_rating is not None else 0.0
            review_value = review_count if review_count is not None else 0
            stock_value = stock_qty if stock_qty is not None else (100 if stock_status == "in_stock" else 0)
            price_number = price_value if price_value is not None else 0

            mongo_payload: Dict[str, Any] = {
                "_id": oid_document(product_oid_value),
                "productId": product_id,
                "name": name or f"Sản phẩm {product_id}",
                "description": description,
                "price": to_decimal_document(price_number),
                "brand": brand,
                "soldCount": sold_value,
                "averageRating": rating_value,
                "numReviews": review_value,
                "stock": stock_value,
                "images": images if images else [],
                "legacyId": product_id,
                "seller_id": oid_document(seller_oid_value),
                "status": "active",
            }

            if not mongo_payload.get("brand"):
                mongo_payload.pop("brand", None)

            if primary_image:
                mongo_payload["imageUrl"] = primary_image

            mongo_ready.append(mongo_payload)

    return normalized, mongo_ready


def normalize_reviews() -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    normalized: List[Dict[str, Any]] = []
    mongo_ready: List[Dict[str, Any]] = []
    user_oid_value = ensure_oid(DEFAULT_USER_OID, name="DEFAULT_USER_OID")
    with REVIEWS_SOURCE.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row_index, row in enumerate(reader, start=2):
            product_id = to_int(row.get("product_id", ""))
            review_id = to_int(row.get("review_id", ""))
            if product_id is None or review_id is None:
                continue
            product_oid_value = oid_from_int(product_id)

            rating = to_int(row.get("star", ""))
            created_at = parse_datetime(row.get("time", ""))
            variation = parse_variation(row.get("variation", ""))
            liked_raw = row.get("liked_count", "").strip()
            liked_count = int(liked_raw) if liked_raw.isdigit() else None
            images = parse_images(row.get("images", ""))
            reviewer_name = row.get("reviewer_name", "").strip()
            content_text = (row.get("content", "") or "").strip()
            shop_reply = (row.get("shop_reply", "") or "").strip() or None

            normalized_payload: Dict[str, Any] = {
                "_id": f"{product_id}-{review_id}",
                "productId": product_id,
                "reviewId": review_id,
                "rating": rating,
                "reviewer": {
                    "name": reviewer_name or None,
                },
                "content": content_text or None,
                "createdAt": created_at,
                "variation": variation,
                "metrics": {
                    "likedCount": liked_count,
                },
                "media": {
                    "images": images,
                },
                "shopReply": shop_reply,
                "source": {
                    "file": REVIEWS_SOURCE.name,
                    "rowNumber": row_index,
                },
            }

            normalized.append(normalized_payload)

            reviewer_value = reviewer_name or "Ẩn danh"
            content_value = content_text or "Không có nội dung"
            time_value = created_at or (row.get("time", "") or "").strip() or None
            variation_raw = (row.get("variation", "") or "").strip()
            normalized_variation = re.sub(r"\s+", " ", variation_raw) if variation_raw else None
            rating_value = rating if rating is not None and 1 <= rating <= 5 else 5

            mongo_payload: Dict[str, Any] = {
                "product_id": oid_document(product_oid_value),
                "user_id": oid_document(user_oid_value),
                "rating": rating_value,
                "productId": product_id,
                "reviewId": review_id,
                "star": rating if rating is not None else 0,
                "reviewerName": reviewer_value,
                "content": content_value,
                "time": time_value,
                "variation": normalized_variation,
                "likedCount": liked_count if liked_count is not None else 0,
                "images": images,
                "shopReply": shop_reply,
            }

            mongo_ready.append(mongo_payload)

    return normalized, mongo_ready


def validate_sources() -> None:
    missing = [str(path) for path in (PRODUCTS_SOURCE, REVIEWS_SOURCE) if not path.exists()]
    if missing:
        raise FileNotFoundError("Không tìm thấy dữ liệu nguồn: " + ", ".join(missing))


def main() -> None:
    validate_sources()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    products_normalized, products_mongo = normalize_products()
    reviews_normalized, reviews_mongo = normalize_reviews()

    write_ndjson(PRODUCTS_TARGET, products_normalized)
    write_ndjson(REVIEWS_TARGET, reviews_normalized)
    write_ndjson(PRODUCTS_MONGO_TARGET, products_mongo)
    write_ndjson(REVIEWS_MONGO_TARGET, reviews_mongo)

    print(f"✅ Đã chuẩn hóa {len(products_normalized)} sản phẩm -> {PRODUCTS_TARGET}")
    print(f"✅ Đã chuẩn hóa {len(products_mongo)} sản phẩm -> {PRODUCTS_MONGO_TARGET}")
    print(f"✅ Đã chuẩn hóa {len(reviews_normalized)} đánh giá -> {REVIEWS_TARGET}")
    print(f"✅ Đã chuẩn hóa {len(reviews_mongo)} đánh giá -> {REVIEWS_MONGO_TARGET}")


if __name__ == "__main__":
    main()
