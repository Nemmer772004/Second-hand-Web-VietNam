
<div align="center">
<h1># 🤖 AI-Agent — Chatbot & Recommendation</h1>
</div>
<div align="center">
   <img src="docs/images/logo.png" alt="Logo Đại Học Đại Nam" width="200"/>
   <img src="docs/images/AIoTLab_logo.png" alt="Logo AIoTLab" width="170"/>
</div>

<div align="center">

[![Được thực hiện bởi kazano777zzza-commits](https://img.shields.io/badge/Thực%20hiện%20bởi%20kazano777zzza--commits-blue?style=for-the-badge)](mailto:namnamnamaa8@gmail.com)  
[![Nguyễn Phương Nam](https://img.shields.io/badge/Người%20thực%20hiện-Nguyễn%20Phương%20Nam-green?style=for-the-badge)](mailto:namnamnamaa8@gmail.com)  
[![Email](https://img.shields.io/badge/Email-namnamnamaa8@gmail.com-red?style=for-the-badge)](mailto:namnamnamaa8@gmail.com)

</div>

<h3 align="center">Tập trung vào module <code>ai-agent</code> — Chatbot & Hệ Gợi Ý Cá Nhân Hóa</h3>

<p align="center">
   <strong>Module <code>ai-agent/</code> cung cấp pipeline Chatbot + Recommendation (BERT4Rec), tích hợp RAG, tool routing và các pipelines phân tích hành vi để phục vụ frontend và các microservice khác.</strong>
</p>

<p align="center">
   <a href="#ai-agent">AI Agent</a> •
   <a href="#-kiến-trúc">Kiến trúc</a> •
   <a href="#-cài-đặt">Cài đặt</a> •
   <a href="#-bắt-đầu">Bắt đầu</a> •
   <a href="#-tài-liệu">Tài liệu</a>
</p>

---

## ai-agent

Thư mục `ai-agent/` chứa toàn bộ logic xử lý hội thoại và gợi ý sản phẩm:

```text
ai-agent/
├── README.md                # Hướng dẫn chi tiết (xem nội dung bên dưới)
├── requirements.txt
├── data/                    # Dữ liệu raw & preprocessing
├── recommender/             # Huấn luyện BERT4Rec
├── pipelines/               # behavior_analyzer, decision_policy, rag_search, tool_router
└── services/api/            # FastAPI service (entrypoint)
```

Tóm tắt nhanh:
- Dùng BERT4Rec để huấn luyện mô hình gợi ý.
- Pipeline RAG + VectorDB cho truy xuất ngữ nghĩa/kiến thức dự án.
- FastAPI service để cung cấp endpoint `/chat`, `/recommend`, `/health`.

Hướng dẫn nhanh (xem thêm trong `ai-agent/README.md`):

```bash
# Tạo venv và cài đặt
python -m venv ai-agent/venv
source ai-agent/venv/bin/activate
pip install --upgrade pip
pip install -r ai-agent/requirements.txt

# Chạy API (local)
uvicorn ai_agent.services.api.app:app --host 0.0.0.0 --port 8008
```

Endpoints quan trọng:
- `GET /health` — kiểm tra trạng thái, `modelReady` cho biết mô hình đã nạp.
- `POST /chat` — gửi tin nhắn tới chatbot (hỗ trợ tool routing và RAG).
- `POST /recommend` — trả kết quả gợi ý (nếu mô hình recommender đã sẵn sàng).

---

## 🏗️ Kiến trúc

Sơ đồ kiến trúc hệ thống (tập trung vào AI Agent):

<div align="center">
   <img src="images/cau truc he thong.png" alt="Sơ đồ Kiến trúc Hệ thống" width="800"/>
</div>

Kiến trúc tóm tắt (liên quan tới <code>ai-agent</code>):

1. User/Frontend gọi API chatbot/recommend.
2. `ai-agent/services/api` xử lý yêu cầu, route sang RAG/tool hoặc recommender.
3. `pipelines/behavior_analyzer` thu thập & chuẩn hoá hành vi cho mô hình.
4. `recommender/` huấn luyện và lưu checkpoint BERT4Rec; `modelReady` bật endpoint trả gợi ý.

---

## 🔧 Cài đặt (tập trung ai-agent)

1. Tạo virtualenv cho toàn repo hoặc chỉ `ai-agent` như trên.
2. Cài dependencies:
```bash
pip install -r ai-agent/requirements.txt
```
3. Nếu cần huấn luyện recommender, thực hiện các script preprocessing trong `ai-agent/data/preprocessing` rồi chạy `ai-agent/recommender/train_bert4rec.py`.

---

## 🚀 Bắt đầu (quick start)

1. Khởi động `ai-agent` API:

```bash
source ai-agent/venv/bin/activate
uvicorn ai_agent.services.api.app:app --host 0.0.0.0 --port 8008
# hoặc chạy ./start.sh nếu script đã được chuẩn hoá ở root
```

2. Kiểm tra trạng thái mô hình:

```bash
curl http://localhost:8008/health
```

3. Gọi thử chatbot:

```bash
curl -X POST http://localhost:8008/chat -H "Content-Type: application/json" -d '{"message":"hi"}'
```

---


## 📜 Poster & Tài liệu liên quan

**Poster dự án AI Agent:**
👉 [Xem Poster PDF tại đây](docs/AI_Agent.pdf)

Tài liệu chi tiết:
- [ARCHITECTURE.md](ai-agent/docs/ARCHITECTURE.md)
- [README chi tiết AI Agent](ai-agent/README.md)

---


## 📝 Giấy phép & Liên hệ
© 2025 Nguyễn Phương Nam (kazano777zzza-commits) — namnamnamaa8@gmail.com

<div align="center">
   Được thực hiện với 💻 bởi Nguyễn Phương Nam  
   [Email liên hệ](mailto:namnamnamaa8@gmail.com)
</div>
```
