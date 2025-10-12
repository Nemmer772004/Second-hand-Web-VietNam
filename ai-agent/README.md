# AI Agent (Chatbot & Recommendation)

Thư mục `ai-agent/` triển khai toàn bộ pipeline chatbot + gợi ý cá nhân hoá cho hệ thống.

```
ai-agent/
├── README.md
├── requirements.txt
├── venv/
├── __init__.py
├── data/
│   ├── raw/
│   └── preprocessing/
├── recommender/
│   ├── configs/
│   ├── dataset/
│   ├── logs/
│   ├── saved/
│   └── train_bert4rec.py
├── services/
│   └── api/
│       ├── app.py
│       └── __init__.py
├── pipelines/
│   ├── behavior_analyzer/
│   ├── decision_policy/
│   ├── rag_search/
│   └── tool_router/
└── docs/
    └── ARCHITECTURE.md
```

## 1. Chuẩn bị môi trường
```bash
python -m venv ai-agent/venv
source ai-agent/venv/bin/activate
pip install --upgrade pip
pip install -r ai-agent/requirements.txt
```

## 2. Tiền xử lý & Huấn luyện gợi ý
```bash
# Sinh dữ liệu hành vi mô phỏng + chuẩn hoá RecBole
python ai-agent/data/preprocessing/user_behavior_advanced.py
python ai-agent/data/preprocessing/prepare_interactions_for_recbole.py

# Huấn luyện mô hình BERT4Rec
python ai-agent/recommender/train_bert4rec.py
```
Kết quả: dataset tại `recommender/dataset/ecommerce/` và checkpoint `.pth` trong `recommender/saved/`.

## 3. Chạy dịch vụ FastAPI
```bash
uvicorn ai_agent.services.api.app:app --host 0.0.0.0 --port 8008
# hoặc dùng ./start.sh tại thư mục gốc dự án
```

- Nếu chưa có checkpoint phù hợp, dịch vụ vẫn khởi động với chế độ dự phòng: chatbot trả lời tin nhắn nhưng sẽ báo “hệ thống gợi ý đang bảo trì” thay vì trả danh sách sản phẩm. Khi mô hình sẵn sàng, gọi lại API `/chat` sẽ tự động trả kết quả.
- Kiểm tra sức khỏe và trạng thái mô hình qua `GET /health` – trường `modelReady` cho biết mô hình đã nạp thành công hay chưa, `details` ghi chú lỗi (nếu có). Có thể tích hợp endpoint này vào hệ thống giám sát/prometheus alert.

## 4. Mapping kiến trúc
- **User Layer**: frontend + icon chatbot gọi API `ai_agent.services.api`.
- **Behavior Analyzer** (`pipelines/behavior_analyzer/`): xử lý log hành vi từ AI service/DB.
- **Recommender Core** (`recommender/`): huấn luyện & lưu BERT4Rec.
- **Decision Policy / Trigger** (`pipelines/decision_policy/`): quyết định khi nào gửi gợi ý/trigger tự động.
- **RAG Search** (`pipelines/rag_search/`): tích hợp LangChain + VectorDB cho truy xuất ngữ nghĩa.
- **Tool Router & Chatbot LLM** (`pipelines/tool_router/`, `services/api`): điều phối hành động, phản hồi người dùng.
- **Data Store**: hành vi, sản phẩm, embedding lưu ở Postgres/Mongo/VectorDB thông qua các microservice khác.

> Các thư mục trong `pipelines/` hiện là placeholder để dễ dàng mở rộng thêm logic trong tương lai.
