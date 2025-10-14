from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd
import torch
from recbole.quick_start import run_recbole

DEFAULT_TOPK: List[int] = [5, 10]


def load_dataset_stats(dataset_dir: Path) -> Dict[str, int]:
    stats = {"rows": 0, "users": 0, "items": 0, "positive_labels": 0}
    manifest_file = dataset_dir / "latest_manifest.json"
    if manifest_file.exists():
        try:
            payload = json.loads(manifest_file.read_text(encoding="utf-8"))
            for key in stats:
                if key in payload and isinstance(payload[key], (int, float)):
                    stats[key] = int(payload[key])
        except Exception as exc:  # noqa: BLE001
            print(f"⚠️  Không thể đọc {manifest_file.name}: {exc}")
    return stats


def determine_eval_params(dataset_dir: Path) -> Tuple[List[int], str, Dict[str, int]]:
    stats = load_dataset_stats(dataset_dir)
    dataset_file = dataset_dir / "ecommerce" / "ecommerce.inter"
    unique_items = stats.get("items", 0)
    unique_users = stats.get("users", 0)
    total_rows = stats.get("rows", 0)

    if dataset_file.exists():
        try:
            df = pd.read_csv(dataset_file, sep="\t")
            item_col = next((col for col in df.columns if col.startswith("item_id")), None)
            user_col = next((col for col in df.columns if col.startswith("user_id")), None)
            if item_col:
                unique_items = int(df[item_col].dropna().nunique())
            if user_col:
                unique_users = int(df[user_col].dropna().nunique())
            total_rows = int(df.shape[0])
        except Exception as exc:  # noqa: BLE001
            print(f"⚠️  Không thể đọc {dataset_file.name}: {exc}")

    if unique_items <= 0:
        unique_items = 1
    if unique_users <= 0:
        unique_users = 0
    if total_rows <= 0 and dataset_file.exists():
        total_rows = int(dataset_file.stat().st_size > 0)

    clamped_topk = sorted({max(1, min(unique_items, k)) for k in DEFAULT_TOPK})
    topk_values: List[int] = []
    seen = set()
    for value in clamped_topk:
        if value not in seen and value <= unique_items:
            topk_values.append(value)
            seen.add(value)
    if not topk_values:
        topk_values = [max(1, min(unique_items, DEFAULT_TOPK[0]))]

    valid_metric = f"MRR@{topk_values[-1]}"

    stats["items"] = unique_items
    stats["users"] = unique_users
    stats["rows"] = total_rows
    return topk_values, valid_metric, stats


def train_once(config_root: Path, dataset_dir: Path, topk_values: List[int], valid_metric: str) -> None:
    run_recbole(
        model="BERT4Rec",
        config_file_list=[str(config_root / "configs" / "bert4rec.yaml")],
        config_dict={
            "data_path": str(dataset_dir),
            "topk": topk_values,
            "valid_metric": valid_metric,
            "use_gpu": False,
            "device": "cpu",
        },
    )


if __name__ == "__main__":
    if hasattr(torch.serialization, "_default_to_weights_only"):
        torch.serialization._default_to_weights_only = (
            lambda pickle_module=None: False  # disable weights_only for RecBole checkpoints
        )

    project_root = Path(__file__).resolve().parents[1]
    dataset_dir = project_root / "dataset"
    topk_values, valid_metric, stats = determine_eval_params(dataset_dir)

    print(
        "🔧 Sử dụng topk="
        f"{topk_values}, valid_metric={valid_metric}, rows={stats.get('rows')}, "
        f"users={stats.get('users')}, items={stats.get('items')}, device=cpu"
    )

    try:
        train_once(project_root, dataset_dir, topk_values, valid_metric)
    except RuntimeError as exc:
        message = str(exc).lower()
        if "selected index k out of range" in message and topk_values:
            fallback = [k for k in topk_values if k < topk_values[-1]]
            if not fallback and topk_values[-1] > 1:
                fallback = [max(1, topk_values[-1] - 1)]
            if fallback:
                print(
                    f"⚠️  topk={topk_values} vượt quá số item khi đánh giá. "
                    f"Thử lại với topk={fallback}."
                )
                train_once(project_root, dataset_dir, fallback, f"MRR@{fallback[-1]}")
            else:
                raise
        else:
            raise
