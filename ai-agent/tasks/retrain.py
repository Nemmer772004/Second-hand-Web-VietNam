#!/usr/bin/env python3
"""
Batch retraining pipeline for the chatbot recommender.

Steps:
 1. Aggregate user behaviour into intermediary CSVs.
 2. Convert CSVs to RecBole dataset files.
 3. Train the BERT4Rec recommender.
 4. Copy the latest checkpoint to the serving directory.

Schedule this script (e.g. cron) every 12 hours.
"""

from __future__ import annotations

import logging
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Iterable, List

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BASE_DIR = PROJECT_ROOT.parent
LOG_DIR = PROJECT_ROOT / "log"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOGGER = logging.getLogger("ai_agent.retrain")
LOGGER.setLevel(logging.INFO)
_handler = logging.FileHandler(LOG_DIR / "retrain.log", encoding="utf-8")
_handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
LOGGER.addHandler(_handler)


def run_step(command: Iterable[str], cwd: Path) -> None:
  LOGGER.info("Running: %s", " ".join(command))
  result = subprocess.run(
      command,
      cwd=str(cwd),
      stdout=subprocess.PIPE,
      stderr=subprocess.STDOUT,
      text=True,
      check=False,
  )
  LOGGER.info(result.stdout)
  if result.returncode != 0:
    raise RuntimeError(f"Command failed ({result.returncode}): {' '.join(command)}")


def copy_latest_checkpoint() -> Path:
  training_dir = PROJECT_ROOT / "recommender" / "training" / "saved"
  serving_dir = PROJECT_ROOT / "recommender" / "saved"
  serving_dir.mkdir(parents=True, exist_ok=True)

  candidates: List[Path] = sorted(
      training_dir.glob("BERT4Rec-*.pth"),
      key=lambda p: p.stat().st_mtime,
      reverse=True,
  )
  if not candidates:
    raise FileNotFoundError(f"No checkpoints found in {training_dir}")

  src = candidates[0]
  dest = serving_dir / src.name
  shutil.copy2(src, dest)
  LOGGER.info("Copied checkpoint %s -> %s", src, dest)
  return dest


def main() -> None:
  LOGGER.info("=== Retraining pipeline started ===")
  started = datetime.utcnow()

  run_step([sys.executable, "user_behavior_advanced.py"], PROJECT_ROOT / "data" / "preprocessing")
  run_step([sys.executable, "prepare_interactions_for_recbole.py"], PROJECT_ROOT / "data" / "preprocessing")
  run_step([sys.executable, "train_bert4rec.py"], PROJECT_ROOT / "recommender")

  checkpoint = copy_latest_checkpoint()
  elapsed = datetime.utcnow() - started
  LOGGER.info("Retraining completed in %s. Latest checkpoint: %s", elapsed, checkpoint)
  LOGGER.info("=== Retraining pipeline finished ===")


if __name__ == "__main__":
  try:
    main()
  except Exception as exc:  # pylint: disable=broad-except
    LOGGER.exception("Retraining pipeline failed: %s", exc)
    sys.exit(1)
