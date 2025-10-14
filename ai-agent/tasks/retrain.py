#!/usr/bin/env python3
"""
Automated retraining pipeline for the BERT4Rec recommender.

Features:
  • Extract interaction logs from Postgres.
  • Build versioned RecBole datasets with atomic "current" pointers.
  • Train BERT4Rec and publish versioned checkpoints with atomic swaps.
  • Maintain a status manifest for the admin dashboard.
  • Optional scheduler mode (default interval: 5 minutes) with locking to
    avoid concurrent runs and support manual trigger overrides.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import shutil
import subprocess
import sys
import time
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import requests

PROJECT_ROOT = Path(__file__).resolve().parents[1]
LOG_DIR = PROJECT_ROOT / "log"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOGGER = logging.getLogger("ai_agent.retrain")
LOGGER.setLevel(logging.INFO)
LOGGER.propagate = False

FILE_HANDLER = logging.FileHandler(LOG_DIR / "retrain.log", encoding="utf-8")
FILE_HANDLER.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
LOGGER.addHandler(FILE_HANDLER)

CONSOLE_HANDLER = logging.StreamHandler(sys.stdout)
CONSOLE_HANDLER.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
LOGGER.addHandler(CONSOLE_HANDLER)

STATUS_PATH = LOG_DIR / "retrain_status.json"
LOCK_PATH = LOG_DIR / "retrain.lock"
STATUS_TMP_SUFFIX = ".tmp"

DATA_PREP_DIR = PROJECT_ROOT / "data" / "preprocessing"
DATASET_DIR = PROJECT_ROOT / "recommender" / "dataset"
DATASET_VERSIONS = DATASET_DIR / "versions"
DATASET_LATEST_MANIFEST = DATASET_DIR / "latest_manifest.json"
DATASET_CURRENT_LINK = DATASET_DIR / "current"

TRAINING_DIR = PROJECT_ROOT / "recommender" / "training"
TRAINING_SAVED = TRAINING_DIR / "saved"
SERVING_DIR = PROJECT_ROOT / "recommender" / "saved"
SERVING_VERSIONS = SERVING_DIR / "versions"
SERVING_CURRENT_LINK = SERVING_DIR / "current.pth"
SERVING_LATEST_MANIFEST = SERVING_DIR / "latest_model.json"

DEFAULT_INTERVAL_SECONDS = int(os.getenv("AI_RETRAIN_INTERVAL", "300"))
DEFAULT_KEEP_VERSIONS = int(os.getenv("AI_RETRAIN_KEEP_VERSIONS", "6"))
LOCK_STALE_SECONDS = int(os.getenv("AI_RETRAIN_LOCK_STALE_SECONDS", "5400"))  # 90 minutes
CHATBOT_RELOAD_URL = os.getenv("CHATBOT_RELOAD_URL", "http://localhost:8008/internal/reload")
CHATBOT_RELOAD_TOKEN = os.getenv("CHATBOT_RELOAD_TOKEN")
CHATBOT_RELOAD_TIMEOUT = int(os.getenv("CHATBOT_RELOAD_TIMEOUT", "10"))


def now() -> datetime:
  return datetime.now(UTC)


def iso(dt: Optional[datetime]) -> Optional[str]:
  return dt.isoformat() if dt else None


def read_json(path: Path) -> Dict[str, Any]:
  if not path.exists():
    return {}
  with path.open("r", encoding="utf-8") as fp:
    return json.load(fp)


def deep_merge(target: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
  for key, value in updates.items():
    if isinstance(value, dict) and isinstance(target.get(key), dict):
      deep_merge(target[key], value)
    else:
      target[key] = value
  return target


def write_status(updates: Dict[str, Any]) -> None:
  status = read_json(STATUS_PATH)
  deep_merge(status, updates)
  status["updated_at"] = iso(now())
  tmp_path = STATUS_PATH.with_suffix(STATUS_PATH.suffix + STATUS_TMP_SUFFIX)
  with tmp_path.open("w", encoding="utf-8") as fp:
    json.dump(status, fp, ensure_ascii=False, indent=2)
  os.replace(tmp_path, STATUS_PATH)


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


def prune_versions(directory: Path, keep: int) -> None:
  if keep <= 0 or not directory.exists():
    return
  versions = sorted(
      [path for path in directory.iterdir() if path.is_file() or path.is_dir()],
      key=lambda p: p.stat().st_mtime,
      reverse=True,
  )
  for obsolete in versions[keep:]:
    try:
      if obsolete.is_dir() and not obsolete.is_symlink():
        shutil.rmtree(obsolete)
      else:
        obsolete.unlink()
      LOGGER.info("Removed old version: %s", obsolete)
    except Exception as exc:  # noqa: BLE001
      LOGGER.warning("Unable to remove %s: %s", obsolete, exc)


def load_latest_dataset_manifest() -> Optional[Dict[str, Any]]:
  if DATASET_LATEST_MANIFEST.exists():
    return read_json(DATASET_LATEST_MANIFEST)
  return None


def publish_latest_checkpoint(keep: int) -> Dict[str, Any]:
  SERVING_DIR.mkdir(parents=True, exist_ok=True)
  SERVING_VERSIONS.mkdir(parents=True, exist_ok=True)

  candidates: List[Path] = sorted(
      TRAINING_SAVED.glob("BERT4Rec-*.pth"),
      key=lambda p: p.stat().st_mtime,
      reverse=True,
  )
  if not candidates:
    raise FileNotFoundError(f"No checkpoints found in {TRAINING_SAVED}")

  src = candidates[0]
  dest_version = SERVING_VERSIONS / src.name
  shutil.copy2(src, dest_version)

  ensure_relative_symlink(SERVING_CURRENT_LINK, dest_version)

  prune_versions(SERVING_VERSIONS, keep)

  manifest = {
      "version": src.stem.replace("BERT4Rec-", "", 1),
      "saved_at": iso(datetime.fromtimestamp(dest_version.stat().st_mtime, tz=UTC)),
      "file": str(dest_version),
      "current_link": str(SERVING_CURRENT_LINK),
  }

  tmp_path = SERVING_LATEST_MANIFEST.with_suffix(SERVING_LATEST_MANIFEST.suffix + ".tmp")
  with tmp_path.open("w", encoding="utf-8") as fp:
    json.dump(manifest, fp, ensure_ascii=False, indent=2)
  os.replace(tmp_path, SERVING_LATEST_MANIFEST)

  LOGGER.info("Published checkpoint %s → %s", src, dest_version)
  return manifest


def trigger_chatbot_reload(manifest: Dict[str, Any]) -> None:
  url = (CHATBOT_RELOAD_URL or "").strip()
  if not url:
    LOGGER.info("CHATBOT_RELOAD_URL không được thiết lập, bỏ qua reload chatbot.")
    return

  payload: Dict[str, Any] = {}
  if CHATBOT_RELOAD_TOKEN:
    payload["token"] = CHATBOT_RELOAD_TOKEN

  try:
    response = requests.post(url, json=payload, timeout=CHATBOT_RELOAD_TIMEOUT)
    response.raise_for_status()
    LOGGER.info("Đã yêu cầu chatbot reload thành công: %s", response.json())
  except Exception as exc:  # noqa: BLE001
    LOGGER.warning("Không thể yêu cầu chatbot reload (%s): %s", url, exc)


def run_step(command: Iterable[str], cwd: Path) -> str:
  LOGGER.info("Running: %s (cwd=%s)", " ".join(command), cwd)
  result = subprocess.run(
      command,
      cwd=str(cwd),
      stdout=subprocess.PIPE,
      stderr=subprocess.STDOUT,
      text=True,
      check=False,
  )
  LOGGER.info("%s", result.stdout.strip())
  if result.returncode != 0:
    raise RuntimeError(f"Command failed ({result.returncode}): {' '.join(command)}")
  return result.stdout


def cleanup_stale_lock() -> bool:
  if not LOCK_PATH.exists():
    return False
  age_seconds = time.time() - LOCK_PATH.stat().st_mtime
  if age_seconds > LOCK_STALE_SECONDS:
    try:
      LOCK_PATH.unlink()
      LOGGER.warning("Removed stale lock file (%s seconds old)", int(age_seconds))
      write_status({"lock": {"stale_removed_at": iso(now())}})
      return True
    except Exception as exc:  # noqa: BLE001
      LOGGER.error("Failed to remove stale lock: %s", exc)
  return False


@contextmanager
def pipeline_lock(timeout: Optional[int], context: str):
  if timeout is None:
    deadline: Optional[float] = None
  elif timeout <= 0:
    deadline = time.time()
  else:
    deadline = time.time() + timeout
  while True:
    try:
      fd = os.open(LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
      os.write(fd, str(os.getpid()).encode())
      os.close(fd)
      write_status({
          "lock": {
              "held": True,
              "owner_pid": os.getpid(),
              "context": context,
              "acquired_at": iso(now()),
          }
      })
      break
    except FileExistsError:
      if cleanup_stale_lock():
        continue
      if deadline and time.time() >= deadline:
        raise TimeoutError("Another retraining process is currently running.")
      time.sleep(1)
  try:
    yield
  finally:
    if LOCK_PATH.exists():
      try:
        LOCK_PATH.unlink()
      except FileNotFoundError:
        pass
    write_status({"lock": {"held": False, "owner_pid": None, "released_at": iso(now())}})


@dataclass
class RunResult:
  dataset: Optional[Dict[str, Any]]
  model: Dict[str, Any]
  started_at: datetime
  finished_at: datetime


def execute_pipeline(keep_versions: int) -> RunResult:
  started = now()
  write_status({
      "status": "running",
      "last_run_started_at": iso(started),
      "last_error": None,
  })

  run_step([sys.executable, "user_behavior_advanced.py"], DATA_PREP_DIR)
  run_step([sys.executable, "prepare_interactions_for_recbole.py"], DATA_PREP_DIR)

  dataset_manifest = load_latest_dataset_manifest()
  prune_versions(DATASET_VERSIONS, keep_versions)

  run_step([sys.executable, "train_bert4rec.py"], TRAINING_DIR)

  model_manifest = publish_latest_checkpoint(keep_versions)
  trigger_chatbot_reload(model_manifest)

  finished = now()
  write_status({
      "status": "idle",
      "last_run_finished_at": iso(finished),
      "last_success_at": iso(finished),
      "dataset": dataset_manifest,
      "model": model_manifest,
  })

  return RunResult(dataset=dataset_manifest, model=model_manifest, started_at=started, finished_at=finished)


def report_failure(error: Exception) -> None:
  finished = now()
  write_status({
      "status": "failed",
      "last_run_finished_at": iso(finished),
      "last_error": str(error),
  })
  LOGGER.exception("Retraining pipeline failed: %s", error)


def run_once(keep_versions: int, timeout: Optional[int], context: str) -> int:
  try:
    with pipeline_lock(timeout=timeout, context=context):
      result = execute_pipeline(keep_versions)
      duration = result.finished_at - result.started_at
      LOGGER.info(
          "Retraining completed in %s | dataset=%s | model=%s",
          duration,
          (result.dataset or {}).get("version"),
          result.model.get("version"),
      )
    return 0
  except TimeoutError as exc:
    LOGGER.warning("%s", exc)
    write_status({
        "status": "queued",
        "last_error": str(exc),
    })
    return 2
  except Exception as exc:  # noqa: BLE001
    report_failure(exc)
    return 1


def schedule_loop(interval_seconds: int, keep_versions: int) -> None:
  write_status({
      "scheduler": {
          "active": True,
          "interval_seconds": interval_seconds,
          "started_at": iso(now()),
      }
  })

  next_run = now()
  try:
    while True:
      write_status({"next_scheduled_at": iso(next_run)})
      wait_seconds = max(0, (next_run - now()).total_seconds())
      while wait_seconds > 0:
        sleep_chunk = min(30, wait_seconds)
        time.sleep(sleep_chunk)
        wait_seconds -= sleep_chunk

      exit_code = run_once(keep_versions=keep_versions, timeout=None, context="scheduler")
      if exit_code not in (0, 2):
        LOGGER.warning("Scheduled run exited with code %s", exit_code)

      next_run = now() + timedelta(seconds=interval_seconds)
      write_status({"next_scheduled_at": iso(next_run)})
  finally:
    write_status({
        "scheduler": {
            "active": False,
            "stopped_at": iso(now()),
        },
        "next_scheduled_at": None,
    })


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description="Retrain the BERT4Rec recommender.")
  parser.add_argument(
      "--interval",
      type=int,
      help="Run continuous scheduler with the given interval in seconds (default: 300).",
  )
  parser.add_argument(
      "--keep-versions",
      type=int,
      default=DEFAULT_KEEP_VERSIONS,
      help="Number of dataset/model versions to keep (default from AI_RETRAIN_KEEP_VERSIONS or 6).",
  )
  parser.add_argument(
      "--wait",
      action="store_true",
      help="When running once, wait for other executions to finish instead of failing immediately.",
  )
  parser.add_argument(
      "--timeout",
      type=int,
      default=60,
      help="Maximum seconds to wait for the lock in --wait mode (default: 60).",
  )
  return parser.parse_args()


def main() -> int:
  args = parse_args()
  interval = args.interval or DEFAULT_INTERVAL_SECONDS

  if args.interval:
    LOGGER.info("Starting scheduler mode (interval=%ss, keep=%s)", interval, args.keep_versions)
    schedule_loop(interval_seconds=interval, keep_versions=args.keep_versions)
    return 0

  timeout = args.timeout if args.wait else 0
  LOGGER.info("Starting single retraining run (timeout=%s)", timeout)
  return run_once(
      keep_versions=args.keep_versions,
      timeout=timeout,
      context="manual",
  )


if __name__ == "__main__":
  sys.exit(main())
