- <div align="center">
<h1># 🤖 Hệ Thống AI-Agent Cho Nền Tảng Đồ Cũ</h1>
</div>
<div align="center">
  <img src="docs/2.png" alt="Second-hand Platform" width="220"/>
  <img src="docs/data.png" alt="AI Agent Pipeline" width="260"/>
</div>

<div align="center">

[![Được phát triển bởi Project-A](https://img.shields.io/badge/Được%20phát%20triển%20bởi-Project--A-blue?style=for-the-badge)](#)  
[![Module AI-Agent](https://img.shields.io/badge/Module-AI--Agent-green?style=for-the-badge)](#ai-agent)  
[![Kết hợp Chatbot & Gợi ý](https://img.shields.io/badge/Chatbot%20%2B%20Recommendation-red?style=for-the-badge)](#-tính-năng-chính)

</div>

<h3 align="center">🔬 Tăng Trải Nghiệm Mua Bán Đồ Cũ Bằng AI Hội Thoại & Cá Nhân Hoá</h3>

<p align="center">
  <strong>Trợ lý AI điều phối hội thoại, tìm kiếm ngữ nghĩa và gợi ý sản phẩm theo hành vi trên nền tảng Second-hand Web VietNam.</strong>
</p>

<p align="center">
  <a href="#-kiến-trúc">Kiến trúc</a> •
  <a href="#-tính-năng-chính">Tính năng</a> •
  <a href="#-công-nghệ-sử-dụng">Công nghệ</a> •
  <a href="#-cài-đặt">Cài đặt</a> •
  <a href="#-bắt-đầu">Bắt đầu</a> •
  <a href="#-tài-liệu">Tài liệu</a>
</p>

---

## 🏗️ Kiến trúc

<div align="center">
  <img src="docs/data.png" alt="Kiến trúc AI Agent" width="820"/>
</div>

Hệ thống AI-Agent được triển khai theo kiến trúc nhiều tầng trong thư mục `ai-agent/`:

1. **💬 Lớp Hội Thoại (FastAPI Gateway)**: Endpoint `/chat` nhận tin nhắn, phân loại nhu cầu, trả lời tức thì hoặc kích hoạt pipeline gợi ý; `/health` & `/internal/reload` dùng giám sát và xoay vòng checkpoint.
2. **🧭 Tool Router & Policy**: `pipelines/tool_router/` và `pipelines/decision_policy/` điều phối giữa chatbot LLM, BERT4Rec, RAG search và các tool khác dựa trên intent.
3. **🧠 Core AI**:
   - `recommender/` chứa data chuẩn hoá RecBole, cấu hình `configs/bert4rec.yaml` và script huấn luyện `train_bert4rec.py`.
   - `pipelines/rag_search/` tích hợp LangChain + VectorDB (Qdrant) để truy xuất tri thức (FAQ, mô tả sản phẩm).
   - `pipelines/behavior_analyzer/` xử lý log hành vi để tái huấn luyện hoặc kích hoạt chiến dịch.
4. **📦 Data Plane**: `data/raw/`, `data/preprocessing/` sinh dữ liệu mô phỏng, chuẩn hoá catalog, xây interaction theo chuẩn RecBole; checkpoint lưu tại `recommender/saved/`.

---

## ✨ Tính năng chính

### 🧠 Chatbot đa năng
- **Hiểu intent & fallback thông minh**: nhận biết yêu cầu gợi ý, đặt hàng, bảo hành; khi mô hình chưa sẵn sàng sẽ trả lời lịch sự và hướng dẫn tiếp.
- **Macro trả lời nhanh**: `simple_reply()` xử lý FAQ phổ biến (vận chuyển, thanh toán, bảo hành) để giảm tải LLM.
- **Tái nạp nóng**: endpoint `/internal/reload` cho phép cập nhật checkpoint mới mà không cần khởi động lại dịch vụ.

### 🎯 Gợi ý cá nhân hoá
- **BERT4Rec trên hành vi dọc TMĐT**: tận dụng lịch sử tương tác (sequence) để dự đoán top-k sản phẩm kế tiếp.
- **Map sản phẩm động**: tự đồng bộ tên hiển thị từ `products.csv` trong `recommender/dataset/` hoặc `data/raw/`.
- **Giới hạn độ dài linh hoạt**: đọc `MAX_ITEM_LIST_LENGTH`/`seq_len` từ cấu hình để tối ưu inference trên CPU.

### 📚 Kết hợp tri thức & quan sát
- **RAG search**: nền tảng LangChain + Qdrant (placeholder) cho phép mở rộng sang tóm tắt mô tả sản phẩm, FAQ.
- **Behavior analyzer**: kênh nhận phản hồi `/api/chatbot/feedback` (từ service khác) để ghi log, chuẩn bị retrain.
- **Decision policy**: đặt luật tự động gửi gợi ý (ví dụ: khi user bỏ giỏ, khi phát hiện chủ đề tìm kiếm cụ thể).

---

## 🔧 Công nghệ sử dụng

<div align="center">

### Ngôn ngữ & Framework
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)  
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)  
[![RecBole](https://img.shields.io/badge/RecBole-orange?style=for-the-badge)](https://recbole.io/)  
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)

### Máy học & Tìm kiếm
[![LangChain](https://img.shields.io/badge/LangChain-1A194D?style=for-the-badge)](https://www.langchain.com/)  
[![Qdrant](https://img.shields.io/badge/Qdrant-FF4D5A?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)  
[![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)

### Vận hành
[![Uvicorn](https://img.shields.io/badge/Uvicorn-2C8EBB?style=for-the-badge)](https://www.uvicorn.org/)  
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)  
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 📥 Cài đặt

### 🛠️ Yêu cầu trước khi cài đặt
- 🐍 **Python** `>=3.10` và `pip`
- 💾 **Dung lượng trống** `~5GB` cho dataset + checkpoint RecBole
- 💻 **CPU hỗ trợ AVX** (khuyến nghị GPU dành cho huấn luyện)
- 📦 **Poetry/Pip + Virtualenv** hoặc Docker
- 🔑 **Biến môi trường** (tuỳ chọn): `CHATBOT_MODEL_DIR`, `CHATBOT_MODEL_PATH`, `CHATBOT_TOPK`, `CHATBOT_RELOAD_TOKEN`

### ⚙️ Thiết lập dự án

1. **Clone kho và vào thư mục gốc**:
   ```bash
   git clone https://github.com/<your-org>/Second-hand-Web-VietNam.git
   cd Second-hand-Web-VietNam
   ```
2. **Tạo môi trường ảo**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3. **Cài đặt phụ thuộc cho AI-Agent**:
   ```bash
   pip install --upgrade pip
   pip install -r ai-agent/requirements.txt
   ```
4. **Cấu hình biến môi trường**:
   ```bash
   cp ai-agent/.env.example ai-agent/.env  # nếu có
   export CHATBOT_MODEL_DIR="ai-agent/recommender/saved"
   export CHATBOT_TOPK=5
   ```
5. **Chuẩn bị dữ liệu hành vi & catalog**:
   ```bash
   python ai-agent/data/preprocessing/normalize_catalog_data.py
   python ai-agent/data/preprocessing/user_behavior_advanced.py
   python ai-agent/data/preprocessing/prepare_interactions_for_recbole.py
   ```
6. **Huấn luyện mô hình BERT4Rec**:
   ```bash
   python ai-agent/recommender/train_bert4rec.py \
     --config_files ai-agent/recommender/configs/bert4rec.yaml
   ```
   Checkpoint mới sẽ được lưu vào `ai-agent/recommender/saved/`.

---

## 🚀 Bắt đầu

### ⚡ Khởi động nhanh dịch vụ FastAPI
```bash
uvicorn ai_agent.services.api.app:app --host 0.0.0.0 --port 8008
```
- Tham số `CHATBOT_MODEL_PATH` cho phép chỉ định trực tiếp file `.pth`.
- Có thể tích hợp vào Docker Compose thông qua service `ai-agent` hoặc script `./start.sh ai-agent`.

### 📥 Thêm dữ liệu & tái huấn luyện
1. Đặt catalog mới trong `ai-agent/data/raw/products.csv` và log tương tác trong `data/raw/interactions.csv`.
2. Chạy lại chuỗi preprocessing (bước 5).
3. Huấn luyện tiếp tục với checkpoint cũ bằng cách đặt `--pretrain_path`.
4. Gọi `POST /internal/reload` kèm `token` để nạp model mới vào dịch vụ đang chạy.

### 🌐 API chính
- `POST /chat`: `{ "message": "...", "user_id": "123", "top_k": 5 }`
- `GET /health`: kiểm tra trạng thái model (`modelReady`, `details`).
- `POST /internal/reload`: reload checkpoint (yêu cầu `CHATBOT_RELOAD_TOKEN` nếu cấu hình).

---

## 📜 Poster Dự Án

<div align="center">
  <img src="docs/case.png" alt="Poster / Use-case AI Agent" width="600"/>
</div>

---

## 📚 Tài liệu
- 📖 `ai-agent/docs/ARCHITECTURE.md` – mô tả mapping các module.
- 🏗️ `ai-agent/recommender/configs/bert4rec.yaml` – thông số RecBole.
- 🧪 `tests/` (đang cập nhật) – dự kiến chứa contract test cho API chatbot.

---

## 📝 Giấy phép
© 2024 Project-A. Nội dung chỉ sử dụng trong nội bộ Second-hand Web VietNam trừ khi được cấp phép khác.

<div align="center">
  Được thực hiện với 💚 bởi đội AI-Agent • Project-A  
  [Website](#) • [GitHub](https://github.com/Trinhvhao) • [Liên hệ](mailto:contact@example.com)
</div>
