<h1 align="center">Second-hand Web VietNam</h1>
<p align="center">
  Nền tảng thương mại điện tử chuyên biệt cho thị trường đồ đã qua sử dụng tại Việt Nam.<br/>
  Monorepo kết hợp Next.js hiện đại và hệ thống Microservices NestJS, tối ưu trải nghiệm người dùng & quản trị.
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/></a>
  <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-Microservices-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/></a>
  <a href="https://graphql.org/"><img src="https://img.shields.io/badge/GraphQL-Build%20BFF-E10098?style=for-the-badge&logo=graphql&logoColor=white" alt="GraphQL"/></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-NoSQL-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-Relational-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
</p>

---

## Mục Lục
- [Tổng Quan](#tổng-quan)
- [Điểm Nổi Bật](#điểm-nổi-bật)
- [Sơ Đồ Hệ Thống](#sơ-đồ-hệ-thống)
- [Giao Diện Tham Khảo](#giao-diện-tham-khảo)
- [Công Nghệ Chủ Đạo](#công-nghệ-chủ-đạo)
- [Cấu Trúc Monorepo](#cấu-trúc-monorepo)
- [Thiết Lập Môi Trường](#thiết-lập-môi-trường)
- [Vận Hành & Phát Triển](#vận-hành--phát-triển)
- [Kiểm Thử](#kiểm-thử)
- [Định Hướng Tiếp Theo](#định-hướng-tiếp-theo)

---

## Tổng Quan
- **Tầm nhìn**: Xây dựng chợ đồ cũ kiểu mới — minh bạch, an toàn, cá nhân hóa trải nghiệm mua bán.
- **Kiến trúc**: Monorepo gồm ứng dụng khách (`frontend`), dashboard quản trị (`admin`) và cụm microservices NestJS giao tiếp qua API Gateway GraphQL.
- **Khả năng mở rộng**: Mỗi service độc lập vòng đời, có thể scale theo nhu cầu nghiệp vụ; hỗ trợ tích hợp AI và tác vụ realtime.

---

## Điểm Nổi Bật
- **UI/UX hiện đại**: Next.js 14 App Router (TypeScript) với TailwindCSS & Radix UI, tối ưu SEO & tốc độ tải.
- **Quản trị thông minh**: Dashboard Next.js 13 hiển thị thống kê, quản lý sản phẩm/đơn hàng/người dùng nhanh chóng.
- **Chốt giao dịch thông minh**: Genkit SDK (Gemini) gợi ý sản phẩm, gợi ý kịch bản tương tác dựa trên hành vi người dùng.
- **Bảo mật xuyên suốt**: JWT end-to-end, phân quyền theo domain, hỗ trợ refresh token và audit log (qua auth-service).
- **Hạ tầng linh hoạt**: Docker Compose phục vụ dev; dễ chuyển hóa thành deployment container hóa từng service.

---

## Sơ Đồ Hệ Thống
<p align="center">
  <img src="access/images/So_do_tong_quat_he_thong.png" alt="Sơ đồ tổng quát hệ thống" width="100%"/>
</p>

Luồng xử lý chính:
1. Người dùng truy cập `frontend` (cổng `9002`) hoặc quản trị viên truy cập `admin` (cổng `3005`).
2. Request GraphQL/REST được gửi tới API Gateway (NestJS) và xác thực bằng JWT.
3. Gateway định tuyến sang microservice tương ứng qua TCP/gRPC hoặc REST nội bộ.
4. Microservice xử lý nghiệp vụ với MongoDB/PostgreSQL, sau đó trả dữ liệu về gateway.
5. Gateway hợp nhất phản hồi cho client; các tác vụ AI/realtime chạy nền qua `ai-service`.

---

## Giao Diện Tham Khảo
<p align="center">
  <img src="access/images/Trang_chu_user.png" alt="Trang chủ người dùng" width="85%"/>
</p>
<p align="center">
  <img src="access/images/Trang_chu_admin.png" alt="Trang chủ admin" width="85%"/>
</p>

---

## Công Nghệ Chủ Đạo
<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=082032" alt="React"/></a>
  <a href="https://www.apollographql.com/docs/react/"><img src="https://img.shields.io/badge/Apollo_Client-311C87?style=for-the-badge&logo=apollographql&logoColor=white" alt="Apollo Client"/></a>
  <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-GraphQL-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>

</p>

---

## Cấu Trúc Monorepo
```
.
├── frontend/                # Next.js 14 App Router (khách hàng)
├── admin/                   # Next.js 13 dashboard quản trị
├── backend/
│   ├── api-gateway/         # NestJS BFF GraphQL Gateway
│   └── services/
│       ├── product-service/ # Quản lý sản phẩm (NestJS + Mongoose)
│       ├── category-service/
│       ├── order-service/
│       ├── user-service/
│       ├── cart-service/
│       ├── auth-service/    # JWT/AuthN/AuthZ (TypeORM/PostgreSQL)
│       ├── ai-service/      # Nền tảng AI/ML
│       └── contact-service/
├── docs/                    # Tài liệu kiến trúc & luồng dữ liệu
├── tests/                   # Bộ kiểm thử tự động (pytest + Selenium)
├── docker-compose.yml       # Khởi tạo cụm dịch vụ
├── init-mongo.js            # Seed MongoDB cục bộ
└── README.md
```

---

## Thiết Lập Môi Trường
1. **Chuẩn bị**: Cài Node.js ≥ 18, Yarn (hoặc npm) và Python (cho e2e).
2. **Cài phụ thuộc**: Chạy `yarn install` tại thư mục gốc để khởi tạo workspace.
3. **Biến môi trường**:
   ```bash
   cp admin/.env.example admin/.env
   # Tạo .env tương ứng cho frontend và từng service theo hướng dẫn nội bộ
   ```
4. **Cơ sở dữ liệu**:
   - MongoDB cho các domain service (product, order, user, cart...).
   - PostgreSQL (khuyến nghị) cho auth-service khi dùng TypeORM.
5. **Dịch vụ phụ trợ**: Redis/RabbitMQ, email, storage… cấu hình theo nhu cầu triển khai.

---

## Vận Hành & Phát Triển
### Chạy với Yarn Workspaces
```bash
# Cài phụ thuộc chung
yarn install

# API Gateway
yarn workspace api-gateway start:dev

# Microservices (chạy tab riêng)
yarn workspace product-service start:dev
yarn workspace category-service start:dev
yarn workspace order-service start:dev
yarn workspace user-service start:dev
yarn workspace cart-service start:dev
# (auth-service, ai-service, contact-service khởi động tương tự khi cần)

# Ứng dụng Next.js
yarn workspace frontend dev
yarn workspace luxhome-admin dev
```
> Lưu ý: auth-service và ai-service yêu cầu thiết lập credential/database riêng trước khi chạy.

### Chạy với Docker Compose
```bash
docker compose up --build
```
- MongoDB: `27017`
- API Gateway: `4000`
- Frontend: `9002`
- Admin: `3005`
- Microservices: `3001 – 3007`

### Triển khai Production
- Container hóa từng service; quản lý secret/connection string qua biến môi trường hoặc secret manager.
- CI/CD khuyến nghị: lint → typecheck → test → build → deploy (staging/production).
- Giám sát: tích hợp ELK/Cloud Logging, metric/tracing bằng OpenTelemetry khi cần.

---

## Kiểm Thử
- **Lint & Format**: `yarn workspace <package> lint` (ESLint + Prettier).
- **Typecheck**: `yarn workspace frontend typecheck`, Nest CLI build cho backend.
- **E2E**: `pytest -m selenium` (cần Selenium Grid/ChromeDriver); Page Object tại `tests/e2e/pages`.
- **Genkit Sandbox**: `yarn workspace frontend genkit:dev` để thử nghiệm luồng gợi ý AI.

---

## Định Hướng Tiếp Theo
- Mở rộng `ai-service` với pipeline phân tích hành vi nâng cao, tích hợp Kafka/RabbitMQ cho event-driven.
- Bổ sung push notification realtime (WebSocket / SSE) cho người dùng và admin.
- Thiết kế bộ dashboard giám sát (metrics, alert) nhằm theo dõi sức khỏe từng microservice.
- Mọi ý kiến đóng góp: vui lòng tạo issue/PR trực tiếp trên repository.
