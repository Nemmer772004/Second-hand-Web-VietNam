from pathlib import Path
import pandas as pd
import os

BASE_DIR = Path(__file__).resolve().parents[2]
RAW_DIR = BASE_DIR / "data" / "raw"
OUTPUT_DIR = BASE_DIR / "recommender" / "dataset" / "ecommerce"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Đường dẫn file gốc
source_path = RAW_DIR / "user_behavior_40purchase.csv"

# Đọc dữ liệu
df = pd.read_csv(source_path)

# Chỉ giữ cột cần thiết
df = df[["user_id", "product_id", "timestamp", "event_type"]]

# Đổi tên cột cho đúng định dạng
df = df.rename(columns={
    "product_id": "item_id"
})

# Gán label: 1 nếu purchase, ngược lại 0
df["label"] = df["event_type"].apply(lambda x: 1 if x == "purchase" else 0)

# Sắp xếp theo user và timestamp
df = df.sort_values(by=["user_id", "timestamp"])

# Xuất file đúng format RecBole
output_path = OUTPUT_DIR / "ecommerce.inter"
df.to_csv(output_path, index=False)
print(f"✅ Đã tạo file {output_path} ({len(df)} dòng)")
print(df.head(10))
