# AI Recommendation & Chatbot Architecture

Tài liệu này mapping các thành phần trong thư mục `ai-agent/` với sơ đồ AI tổng thể:

- **User Layer**: frontend trigger (Floating chatbot) gửi request tới `ai_agent.services.api.app`.
- **Behavior Analyzer** (`pipelines/behavior_analyzer/`): nơi xử lý log hành vi (sẽ kết nối AI service, Redis/Postgres).
- **Recommender Core** (`recommender/`): data chuẩn hoá (`dataset/`), config (`configs/`), checkpoint (`saved/`) và script train BERT4Rec.
- **Decision Policy / Trigger** (`pipelines/decision_policy/`): module xác định khi nào trả lời/gợi ý tự động.
- **RAG Search** (`pipelines/rag_search/`): tích hợp LangChain + Vector DB (Qdrant) cho ngữ nghĩa.
- **Tool Router** (`pipelines/tool_router/`): điều phối giữa recommender, RAG và chatbot LLM.
- **Chatbot LLM Layer** (`services/api/`): FastAPI nhận input, gọi BERT4Rec, trả lời text & gợi ý.
- **Data Store**: dữ liệu hành vi/sản phẩm/embedding lưu tại các service khác (MongoDB, Postgres, VectorDB) và được truy cập thông qua API gateway.

Luồng chính:
1. User hoặc trigger tự động gửi yêu cầu → `services/api/app.py`.
2. API gọi `recommend_for_user()` (BERT4Rec) → lấy Top-K sản phẩm từ `recommender/saved/`.
3. Thông tin tự enrich từ product-service → trả về user + ghi log vào AI service.
4. Feedback (Hứng thú/Không) gửi về `/api/chatbot/feedback` → `pipelines/behavior_analyzer` (qua AI service) sử dụng để retrain.

Các thư mục `pipelines/*` hiện là placeholder sẵn sàng để triển khai các thành phần nâng cao.
