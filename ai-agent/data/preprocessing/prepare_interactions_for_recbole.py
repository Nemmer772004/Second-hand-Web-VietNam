from __future__ import annotations

import json
import os
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[2]
RAW_DIR = BASE_DIR / "data" / "raw"
OUTPUT_ROOT = BASE_DIR / "recommender" / "dataset"
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
LEGACY_DIR = OUTPUT_ROOT / "ecommerce"
LEGACY_DIR.mkdir(parents=True, exist_ok=True)
VERSIONS_DIR = OUTPUT_ROOT / "versions"
VERSIONS_DIR.mkdir(parents=True, exist_ok=True)
CURRENT_LINK = OUTPUT_ROOT / "current"

SOURCE_FILE = RAW_DIR / "user_behavior_interactions.csv"
BASELINE_FILE = RAW_DIR / "interactions.csv"
TARGET_FILE = OUTPUT_ROOT / "ecommerce.inter"
LEGACY_FILE = LEGACY_DIR / "ecommerce.inter"
MANIFEST_NAME = "manifest.json"
LATEST_MANIFEST = OUTPUT_ROOT / "latest_manifest.json"


def ensure_relative_symlink(link_path: Path, target: Path, *, is_dir: bool = False) -> None:
    link_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_link = link_path.parent / f".{link_path.name}.tmp"

    if tmp_link.exists() or tmp_link.is_symlink():
        if tmp_link.is_dir() and not tmp_link.is_symlink():
            shutil.rmtree(tmp_link)
        else:
            tmp_link.unlink()

    if link_path.exists() or link_path.is_symlink():
        if link_path.is_dir() and not link_path.is_symlink():
            shutil.rmtree(link_path)
        else:
            link_path.unlink()

    relative_target = os.path.relpath(target, start=link_path.parent)
    os.symlink(relative_target, tmp_link, target_is_directory=is_dir)
    os.replace(tmp_link, link_path)


def ensure_unique_version_dir(base: Path, prefix: str) -> Path:
    candidate = base / prefix
    counter = 1
    while candidate.exists():
        candidate = base / f"{prefix}-{counter:02d}"
        counter += 1
    candidate.mkdir(parents=True, exist_ok=True)
    return candidate


def write_manifest(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_fd, tmp_name = tempfile.mkstemp(dir=path.parent, suffix=".json")
    try:
        with os.fdopen(tmp_fd, "w", encoding="utf-8") as fp:
            json.dump(payload, fp, ensure_ascii=False, indent=2)
        os.replace(tmp_name, path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)


def main() -> None:
    if not SOURCE_FILE.exists():
        raise FileNotFoundError(
            f"Không tìm thấy nguồn dữ liệu {SOURCE_FILE}. Vui lòng chạy user_behavior_advanced.py trước."
        )

    # ===== Đọc dữ liệu mới =====
    new_df = pd.read_csv(SOURCE_FILE)
    required_columns = {"session_id", "user_id", "product_id", "timestamp", "event_type"}
    missing = required_columns - set(new_df.columns)
    if missing:
        raise ValueError(f"Dữ liệu nguồn thiếu cột bắt buộc: {', '.join(sorted(missing))}")

    new_df = new_df[list(required_columns)].copy()

    # Làm sạch
    new_df = new_df.astype(str)
    new_df["event_type"] = new_df["event_type"].str.lower().str.strip()
    new_df["timestamp"] = pd.to_datetime(new_df["timestamp"], utc=True, errors="coerce")
    new_df = new_df.dropna(subset=["timestamp"])
    new_df["timestamp"] = new_df["timestamp"].dt.tz_convert("UTC").dt.strftime("%Y-%m-%d %H:%M:%S")

    # ===== Đọc dữ liệu cũ nếu có =====
    if BASELINE_FILE.exists():
        old_df = pd.read_csv(BASELINE_FILE)
        combined = pd.concat([old_df, new_df], ignore_index=True)
        combined = combined.drop_duplicates(
            subset=["session_id", "user_id", "product_id", "timestamp", "event_type"],
            keep="last",
        )
    else:
        combined = new_df

    combined = combined.sort_values(by=["session_id", "timestamp", "product_id", "event_type"])
    combined.to_csv(BASELINE_FILE, index=False)
    print(f"🗂  Đã cập nhật {BASELINE_FILE} (tổng {len(combined)} bản ghi).")

    # ===== Chuẩn bị cho huấn luyện =====
    train_df = combined.copy()
    train_df["item_id"] = train_df["product_id"]
    train_df["label"] = train_df["event_type"].map(lambda x: 1 if x == "purchase" else 0).astype(int)
    train_df["timestamp"] = pd.to_datetime(train_df["timestamp"], utc=True)
    train_df["timestamp"] = train_df["timestamp"].astype("int64") // 10 ** 9
    train_df = train_df.drop_duplicates(subset=["user_id", "item_id", "timestamp", "event_type"], keep="last")
    train_df = train_df.sort_values(by=["user_id", "timestamp"])

    header = ["user_id:token", "item_id:token", "timestamp:float", "label:float"]
    df_to_write = train_df[["user_id", "item_id", "timestamp", "label"]]

    # ===== Snapshot version mới =====
    generated_at = datetime.now(timezone.utc)
    version_prefix = generated_at.strftime("%Y%m%d-%H%M%S")
    version_dir = ensure_unique_version_dir(VERSIONS_DIR, version_prefix)
    version_file = version_dir / TARGET_FILE.name

    df_to_write.to_csv(version_file, index=False, sep="\t", header=header)

    ensure_relative_symlink(TARGET_FILE, version_file)
    ensure_relative_symlink(LEGACY_FILE, version_file)
    ensure_relative_symlink(CURRENT_LINK, version_dir, is_dir=True)

    stats = {
        "version": version_dir.name,
        "generated_at": generated_at.isoformat(),
        "rows": int(df_to_write.shape[0]),
        "users": int(train_df["user_id"].nunique()),
        "items": int(train_df["item_id"].nunique()),
        "positive_labels": int(df_to_write["label"].sum()),
        "file": str(version_file),
        "source": [str(SOURCE_FILE), str(BASELINE_FILE)],
        "header": header,
    }

    write_manifest(version_dir / MANIFEST_NAME, stats)
    write_manifest(LATEST_MANIFEST, stats)

    print(f"✅ Đã tạo snapshot {version_dir.name} ({version_file}) với {stats['rows']} dòng")
    print("👥  User:", stats["users"], "| 🛒  Sản phẩm:", stats["items"])
    print("🏷️   Nhãn mua hàng (label=1):", stats["positive_labels"])
    print(df_to_write.head(10))


if __name__ == "__main__":
    main()
