from pathlib import Path
import pandas as pd
import random
from datetime import datetime, timedelta
import uuid

BASE_DIR = Path(__file__).resolve().parents[2]
RAW_DIR = BASE_DIR / "data" / "raw"

# === 1️⃣ Đọc và làm sạch dữ liệu ===
df = pd.read_csv(RAW_DIR / "reviews.csv")[["product_id", "star"]]
df = df.dropna(subset=["product_id", "star"])
df["product_id"] = df["product_id"].astype(int)
df["star"] = df["star"].astype(int)

num_users = 4000
df["user_id"] = [random.randint(1, num_users) for _ in range(len(df))]

# === 2️⃣ Thời gian hợp lý ===
def next_time(base_time, star):
    if star >= 5:
        delta = timedelta(minutes=random.randint(1, 5))
    elif star == 4:
        delta = timedelta(minutes=random.randint(5, 30))
    elif star == 3:
        delta = timedelta(minutes=random.randint(30, 120))
    else:
        delta = timedelta(minutes=random.randint(10, 60))
    return base_time + delta

# === 3️⃣ Tạo session id ===
def gen_session_id():
    return uuid.uuid4().hex[:8]

# === 4️⃣ Sinh hành vi (đã tăng xác suất mua) ===
def generate_behavior(row):
    behaviors = []
    user_id = int(row["user_id"])
    product_id = int(row["product_id"])
    star = int(row["star"])
    session_id = gen_session_id()
    base_time = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 120))
    t = base_time

    if star >= 5:
        pattern = random.choices([
            ["view", "click", "add_to_cart", "purchase"],
            ["view", "out", "view", "click", "add_to_cart", "purchase"],
            ["view", "click", "add_to_cart", "purchase", "purchase"]
        ], weights=[0.55, 0.35, 0.10])[0]
    elif star == 4:
        pattern = random.choices([
            ["view", "click", "add_to_cart", "purchase"],
            ["view", "click", "add_to_cart", "reject"],
            ["view", "out", "view", "click", "add_to_cart"]
        ], weights=[0.65, 0.20, 0.15])[0]
    elif star == 3:
        pattern = random.choices([
            ["view", "click"],
            ["view", "out", "view", "click"]
        ], weights=[0.7, 0.3])[0]
    else:
        pattern = random.choices([
            ["view", "reject"],
            ["view", "click", "reject"],
            ["view", "out", "view", "reject"]
        ], weights=[0.5, 0.3, 0.2])[0]

    for ev in pattern:
        behaviors.append({
            "session_id": session_id,
            "user_id": user_id,
            "product_id": product_id,
            "timestamp": t.strftime("%Y-%m-%d %H:%M:%S"),
            "event_type": ev
        })
        t = next_time(t, star)

    # User quay lại sau vài ngày (có 30 % mua lại)
    if star >= 4 and random.random() < 0.30:
        session_id = gen_session_id()
        t += timedelta(days=random.randint(1, 5))
        subpattern = random.choices([
            ["view", "click", "purchase"],
            ["view", "click", "add_to_cart", "purchase"]
        ], weights=[0.4, 0.6])[0]
        for ev in subpattern:
            behaviors.append({
                "session_id": session_id,
                "user_id": user_id,
                "product_id": product_id,
                "timestamp": t.strftime("%Y-%m-%d %H:%M:%S"),
                "event_type": ev
            })
            t = next_time(t, star)

    return behaviors

# === 5️⃣ Sinh toàn bộ dữ liệu ===
all_behaviors = []
purchase_count = {}

for _, row in df.iterrows():
    uid, pid = int(row["user_id"]), int(row["product_id"])
    key = (uid, pid)
    if row["star"] >= 5:
        if purchase_count.get(key, 0) >= 2:
            continue
        purchase_count[key] = purchase_count.get(key, 0) + 1
    all_behaviors.extend(generate_behavior(row))

df_behavior = pd.DataFrame(all_behaviors).sort_values(by=["user_id", "timestamp"])

# === 6️⃣ Lưu file ===
output_path = RAW_DIR / "user_behavior_40purchase.csv"
df_behavior.to_csv(output_path, index=False, encoding="utf-8")

print(f"✅ Đã tạo file {output_path}")
print("Tổng số event:", len(df_behavior))
print("Số user:", df_behavior['user_id'].nunique())
print("Số sản phẩm:", df_behavior['product_id'].nunique())
print("Các loại event:", df_behavior['event_type'].value_counts(normalize=True).round(3).to_dict())
print(df_behavior.head(10))
