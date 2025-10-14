"""Extract user behaviour from Postgres into a CSV."""

from __future__ import annotations

import io
import os
import subprocess
import time
from pathlib import Path
from typing import Dict

import pandas as pd

try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:  # pragma: no cover - optional dependency
    psycopg = None  # type: ignore[assignment]
    dict_row = None  # type: ignore[assignment]

BASE_DIR = Path(__file__).resolve().parents[2]
RAW_DIR = BASE_DIR / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = RAW_DIR / "user_behavior_interactions.csv"
MAX_RETRIES = int(os.getenv("AI_PG_RETRIES", "6"))
RETRY_DELAY_SECONDS = int(os.getenv("AI_PG_RETRY_DELAY", "10"))
CONNECT_TIMEOUT_SECONDS = int(os.getenv("AI_PG_CONNECT_TIMEOUT", "5"))
BOOT_TIMEOUT_SECONDS = int(os.getenv("AI_PG_BOOT_TIMEOUT", str(max(90, MAX_RETRIES * RETRY_DELAY_SECONDS))))

QUERY = """
SELECT
    "sessionId" AS session_id,
    "userId" AS user_id,
    "productId" AS product_id,
    "eventType" AS event_type,
    "occurredAt" AS occurred_at
FROM ai_interaction_events
WHERE "userId" IS NOT NULL
  AND "productId" IS NOT NULL
ORDER BY "occurredAt" ASC
"""


def build_conn_info() -> Dict[str, str]:
    return {
        "host": os.getenv("AI_PG_HOST", os.getenv("DB_HOST", "localhost")),
        "port": os.getenv("AI_PG_PORT", os.getenv("DB_PORT", "5432")),
        "dbname": os.getenv("AI_PG_DB", os.getenv("DB_NAME", "secondhand_ai")),
        "user": os.getenv("AI_PG_USER", os.getenv("DB_USERNAME", "nemmer")),
        "password": os.getenv("AI_PG_PASSWORD", os.getenv("DB_PASSWORD", "nemmer")),
    }


def export_via_psql(conn: Dict[str, str]) -> pd.DataFrame:
    psql_cmd = os.getenv("PSQL_COMMAND", "psql")
    conn_str = f"host={conn['host']} port={conn['port']} user={conn['user']} dbname={conn['dbname']}"
    env = os.environ.copy()
    env["PGPASSWORD"] = conn["password"]

    copy_sql = f"COPY ({QUERY}) TO STDOUT WITH CSV HEADER"
    try:
        process = subprocess.run(
            [psql_cmd, conn_str, "-c", copy_sql],
            env=env,
            capture_output=True,
            text=True,
            check=True,
        )
    except FileNotFoundError as exc:
        raise RuntimeError("Không tìm thấy lệnh psql. Vui lòng cài đặt PostgreSQL client.") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"Không thể thực thi truy vấn Postgres: {exc.stderr}") from exc

    if not process.stdout.strip():
        return pd.DataFrame(columns=["user_id", "product_id", "event_type", "occurred_at"])

    return pd.read_csv(io.StringIO(process.stdout))


def export_via_psycopg(conn: Dict[str, str]) -> pd.DataFrame:
    if psycopg is None or dict_row is None:
        raise ImportError("psycopg chưa được cài đặt.")

    with psycopg.connect(
        host=conn["host"],
        port=int(conn["port"]),
        dbname=conn["dbname"],
        user=conn["user"],
        password=conn["password"],
        connect_timeout=CONNECT_TIMEOUT_SECONDS,
        row_factory=dict_row,
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute(QUERY)
            rows = cursor.fetchall()

    if not rows:
        return pd.DataFrame(columns=["session_id", "user_id", "product_id", "event_type", "occurred_at"])

    return pd.DataFrame(rows)


def main() -> None:
    print("🔄 Đang trích xuất data từ Postgres...")
    conn = build_conn_info()
    df: pd.DataFrame
    last_error: Exception | None = None

    if psycopg is not None:
        deadline = time.time() + BOOT_TIMEOUT_SECONDS
        wait_attempt = 1
        while True:
            try:
                with psycopg.connect(
                    host=conn["host"],
                    port=int(conn["port"]),
                    dbname=conn["dbname"],
                    user=conn["user"],
                    password=conn["password"],
                    connect_timeout=CONNECT_TIMEOUT_SECONDS,
                ) as connection:
                    with connection.cursor() as cursor:
                        cursor.execute("SELECT 1")
                        cursor.fetchone()
                break
            except Exception as ready_error:  # noqa: BLE001
                remaining = deadline - time.time()
                if remaining <= 0:
                    raise RuntimeError(
                        f"Postgres không sẵn sàng sau {BOOT_TIMEOUT_SECONDS}s: {ready_error}"
                    ) from ready_error
                wait_for = min(RETRY_DELAY_SECONDS, max(1, int(remaining)))
                print(
                    f"⏳ Postgres chưa sẵn sàng (lần {wait_attempt}): {ready_error}. "
                    f"Chờ {wait_for}s rồi thử lại...",
                    flush=True,
                )
                time.sleep(wait_for)
                wait_attempt += 1

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            df = export_via_psycopg(conn)
            print("🐘 Đã trích xuất bằng psycopg.")
            break
        except Exception as psy_error:  # noqa: BLE001
            last_error = psy_error
            print(f"⚠️  psycopg lỗi ({attempt}/{MAX_RETRIES}): {psy_error}")
            try:
                df = export_via_psql(conn)
                print("📤 Đã fallback sang psql CLI.")
                break
            except Exception as psql_error:  # noqa: BLE001
                combined = RuntimeError(
                    f"psycopg lỗi: {psy_error}; psql lỗi: {psql_error}"
                )
                last_error = combined
                if attempt < MAX_RETRIES:
                    wait_for = RETRY_DELAY_SECONDS * attempt
                    print(f"⏳ Chờ {wait_for}s rồi thử lại...")
                    time.sleep(wait_for)
                else:
                    raise combined
    else:
        if last_error:
            raise last_error
        raise RuntimeError("Không thể trích xuất dữ liệu từ Postgres sau nhiều lần thử.")

    if df.empty:
        print("⚠️  Không có dữ liệu khả dụng trong ai_interaction_events")
        OUTPUT_FILE.write_text("", encoding="utf-8")
        return

    df = df.dropna(subset=["session_id", "user_id", "product_id", "event_type", "occurred_at"])
    df["session_id"] = df["session_id"].astype(str)
    df["user_id"] = df["user_id"].astype(str)
    df["product_id"] = df["product_id"].astype(str)
    timestamps = pd.to_datetime(df["occurred_at"], utc=True, errors="coerce")
    df = df.assign(timestamp=timestamps.dt.tz_convert(None).dt.tz_localize(None))
    df = df.drop(columns=["occurred_at"]).sort_values(by=["session_id", "timestamp"])  # type: ignore[arg-type]

    df = df[["session_id", "user_id", "product_id", "timestamp", "event_type"]]

    df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8")

    print(f"✅ Đã tạo file {OUTPUT_FILE}")
    print("Tổng số event:", len(df))
    print("Số user:", df['user_id'].nunique())
    print("Số sản phẩm:", df['product_id'].nunique())
    print("Các loại event:", df['event_type'].value_counts(normalize=True).round(3).to_dict())
    print(df.head(10))


if __name__ == "__main__":
    main()
