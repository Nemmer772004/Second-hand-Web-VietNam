# Second-hand Web VietNam

Nền tảng thương mại điện tử dành cho thị trường đồ đã qua sử dụng tại Việt Nam. Dự án được tổ chức theo mô hình monorepo, kết hợp nhiều ứng dụng Next.js và cụm microservice NestJS để đáp ứng các bài toán mua bán, quản trị, gợi ý sản phẩm và xử lý dữ liệu thời gian thực.

---

## Tổng Quan Kiến Trúc
- **Frontend (khách hàng)**: Ứng dụng Next.js 14 (App Router) viết bằng TypeScript/React 18. Tích hợp Apollo Client để giao tiếp GraphQL với API Gateway, TailwindCSS & Radix UI cho UI, React Hook Form + Zod để kiểm soát form.
- **Admin (quản trị viên)**: Ứng dụng Next.js 13 riêng biệt, TypeScript/React. Kết nối thẳng API Gateway/REST nội bộ để quản lý sản phẩm, đơn hàng, người dùng.
- **API Gateway**: NestJS GraphQL (cổng 4000) đóng vai trò BFF, xác thực JWT, tổng hợp schema và điều phối request tới microservice qua transport TCP và REST fallback.
- **Microservices**: Nhóm dịch vụ NestJS theo domain (product, category, order, user, cart, auth, ai, contact). Mỗi service có cấu hình và vòng đời độc lập, sử dụng MongoDB/Mongoose hoặc TypeORM tùy domain.
- **AI Layer**: Tích hợp Genkit SDK với Google Gemini tại frontend để dựng flow gợi ý sản phẩm; `ai-service` (NestJS + TypeORM) chuẩn bị mở rộng cho các pipeline AI chạy phía server.
- **Hạ tầng**: Docker Compose vận hành cụm dịch vụ cục bộ (MongoDB, gateway, frontend, admin và microservice). Hệ thống script Yarn Workspace hỗ trợ build/lint/test đồng bộ.

Sơ đồ luồng
1. Người dùng truy cập `frontend` (cổng 9002) hoặc `admin` (cổng 3005).
2. Frontend & admin gửi GraphQL/REST tới API Gateway.
3. Gateway xác thực JWT, gọi tới các microservice theo domain bằng TCP/gRPC hoặc HTTP.
4. Service thao tác dữ liệu trong MongoDB/PostgreSQL, trả kết quả về Gateway.
5. Gateway hợp nhất dữ liệu -> phản hồi client; các tác vụ nền (gợi ý, đồng bộ) chạy qua ai-service/worker.

---

## Cấu Trúc Monorepo
```
.
├── frontend/                # Next.js 14 App Router (khách hàng)
├── admin/                   # Next.js 13 (dashboard quản trị)
├── backend/
│   ├── api-gateway/         # NestJS GraphQL Gateway
│   └── services/
│       ├── product-service/ # Quản lý sản phẩm (NestJS + Mongoose)
│       ├── category-service/
│       ├── order-service/
│       ├── user-service/
│       ├── cart-service/
│       ├── auth-service/    # JWT/AuthN/AuthZ, TypeORM/PostgreSQL (theo tài liệu)
│       ├── ai-service/      # Khung dịch vụ AI/ML
│       └── contact-service/
├── tests/                   # Kiểm thử tự động (pytest + Selenium)
├── docs/                    # Tài liệu kiến trúc, data flow
├── docker-compose.yml       # Khởi tạo toàn bộ cụm dịch vụ
├── init-mongo.js            # Seed MongoDB cục bộ
└── README.md
```

---

## Công Nghệ Chính & Vai Trò
- **Ngôn ngữ**: TypeScript cho toàn bộ frontend/backend; Python cho bộ e2e tests.
- **Frontend**: Next.js 14, React 18, Apollo Client, TailwindCSS, Radix UI, React Hook Form, Zod, Zustand/Context state.
- **Admin**: Next.js 13, React 18, Axios, MongoDB driver (cho chức năng thống kê theo thời gian thực).
- **API Gateway**: NestJS GraphQL, `@nestjs/microservices`, JWT strategy, RxJS; quản lý schema & batching request.
- **Microservice**: NestJS module-based architecture, Mongoose (MongoDB) hoặc TypeORM (PostgreSQL) tùy service; giao tiếp qua TCP/gRPC.
- **AI & Recommendation**: Genkit SDK, plugin `@genkit-ai/googleai`, model `googleai/gemini-2.5-flash` (`frontend/ai/genkit.ts`). Flow gợi ý sản phẩm được định nghĩa trong `frontend/ai/flows/*`.
- **CI/CD & DevOps**: Yarn Workspaces, Docker, Docker Compose, scripts start/stop, env-based config.
- **Testing**: Pytest + Selenium WebDriver cho e2e (`tests/e2e`), Jest (mặc định Nest) và Testing Library (Next.js) có thể cấu hình bổ sung.

---

## Thành Phần Chi Tiết
### Frontend (`frontend/`)
- **Cấu trúc**: App Router (folder `app/`), component tái sử dụng trong `components/`, logic dữ liệu ở `services/`, state/context tại `context/`.
- **Dịch vụ AI**: `frontend/ai/genkit.ts` cấu hình Genkit với Gemini; flow `ai-product-recommendations.ts` sinh gợi ý dựa lịch sử duyệt.
- **Giao tiếp backend**: Apollo Client gọi GraphQL, một số REST helper trong `services/` cho endpoint chuyên biệt.
- **Tooling**: Tailwind config (`tailwind.config.ts`), TS strict, script `genkit:dev` để chạy sandbox AI.

### Admin (`admin/`)
- **Mục tiêu**: Dashboard theo dõi đơn hàng, người dùng, sản phẩm, phản hồi.
- **Stack**: Next.js 13 + TypeScript + Axios. Kết nối API Gateway, hiển thị dữ liệu bảng biểu, biểu đồ.
- **Triển khai**: chạy dev `npm run dev` (cổng 3005). Build/Start phục vụ production.

### API Gateway (`backend/api-gateway/`)
- **Trách nhiệm**: xác thực JWT, stitching schema, routing microservice, áp dụng rate limit/caching (có thể mở rộng).
- **Tệp chính**: `main.ts` (khởi động server + CORS), `resolvers/*.ts` định nghĩa resolver cho từng domain, `schema.graphql` tổng hợp.
- **Kết nối**: Nest Microservices client tới từng service (TCP) và fallback HTTP.

### Microservices (`backend/services/*`)
- **Product/Category/Order/User/Cart**: Mongoose schema, controller REST, message controller cho giao tiếp TCP, module hóa.
- **Auth service**: JWT issuance, refresh token, lưu trữ user profile (theo docs sử dụng PostgreSQL/TypeORM; kiểm tra cấu hình trước khi chạy).
- **AI service**: Nest module với TypeORM skeleton nhằm xử lý recommend, pipeline ML, đồng bộ dữ liệu AI.
- **Shared utilities**: `backend/services/shared/` chứa DTO, interface dùng chung.

---

## Lưu Trữ Dữ Liệu
- **MongoDB**: Dùng cho product/category/order/cart/user service (được khởi tạo qua `init-mongo.js`).
- **PostgreSQL**: Theo tài liệu dành cho auth/cart (xác minh cấu hình trước production). Có thể thay bằng MongoDB nếu muốn đồng nhất.
- **Cache/KV**: Chưa tích hợp, slot mở rộng với Redis/RabbitMQ (được nhắc trong hướng dẫn cấu hình).

---

## Luồng Dữ Liệu & Tương Tác
1. Client gửi GraphQL query/mutation tới Gateway kèm JWT.
2. Gateway xác thực, ánh xạ resolver tương ứng, gửi message tới service (TCP) hoặc gọi REST nội bộ.
3. Service thao tác DB, trả dữ liệu (hoặc publish event).
4. Gateway gom response, trả về client.
5. Các trigger AI (ví dụ gợi ý sản phẩm, đồng bộ catalog) gọi flow Genkit hoặc đẩy sang `ai-service` để xử lý bất đồng bộ.

---

## Công Cụ Phát Triển & Kiểm Thử
- **Lint/Format**: `yarn workspace <pkg> lint`, ESLint + Prettier (Nest & Next).
- **Typecheck**: `yarn workspace frontend typecheck`, Nest CLI build kiểm tra TS.
- **E2E**: Chạy `pytest -m selenium` (cần Selenium Grid / ChromeDriver). Các Page Object nằm trong `tests/e2e/pages`.
- **Genkit Sandbox**: `yarn workspace frontend genkit:dev` để thử prompt AI.

---

## Thiết Lập Môi Trường
1. Cài Node.js ≥ 18, Yarn (hoặc npm) và Python (cho e2e).
2. Cài đặt phụ thuộc: `yarn install` tại thư mục gốc (sử dụng Yarn Workspaces).
3. Sao chép và cập nhật biến môi trường:
   ```bash
   cp admin/.env.example admin/.env
   # Tạo các file .env tương tự cho frontend và mỗi service theo hướng dẫn nội bộ
   ```
4. Chuẩn bị cơ sở dữ liệu: MongoDB (bắt buộc), PostgreSQL nếu chạy auth-service với TypeORM.
5. Cấu hình các dịch vụ phụ (RabbitMQ, email, storage) nếu môi trường của bạn yêu cầu.

---

## Chạy Dự Án (Development)
### Yarn Workspaces
```bash
# Cài phụ thuộc một lần
yarn install

# Gateway
yarn workspace api-gateway start:dev

# Các microservice cần thiết (mở tab riêng)
yarn workspace product-service start:dev
yarn workspace category-service start:dev
yarn workspace order-service start:dev
yarn workspace user-service start:dev
yarn workspace cart-service start:dev
# (auth-service, ai-service, contact-service chạy tương tự khi cần)

# Frontend & Admin
yarn workspace frontend dev
yarn workspace luxhome-admin dev
```
> Lưu ý: một số service (auth, ai) yêu cầu cấu hình DB/credential riêng trước khi khởi động.

### Docker Compose
```bash
docker compose up --build
```
Cổng mặc định: MongoDB 27017, API Gateway 4000, Frontend 9002, Admin 3005, microservice 3001–3007.

---

## Triển Khai & Vận Hành
- Kịch bản Docker/Kubernetes: mỗi service đóng gói container riêng, sử dụng biến môi trường để cấu hình connection string, secret.
- CI/CD: khuyến nghị dùng pipeline build, chạy test (lint/typecheck/e2e), sau đó deploy theo môi trường staging/production.
- Giám sát: tích hợp log collector (ELK/Cloud Logging) và alerting cho gateway/microservice. Có thể mở rộng tracing bằng OpenTelemetry.

---

## Tài Liệu & Tham Khảo
- `docs/architecture.md`: mô tả kiến trúc chi tiết, data flow và checklist triển khai.
- `frontend/README.md`, `backend/**/README` (nếu có): hướng dẫn riêng từng module.
- `tests/e2e/`: ví dụ kiểm thử, mô hình Page Object (`tests/e2e/pages/login.py`).

---

## Đóng Góp
1. Tạo branch mới từ `main`.
2. Thực hiện thay đổi, cập nhật/viết test cần thiết.
3. Chạy lint/typecheck/test trước khi mở Pull Request.
4. Mô tả rõ thay đổi, ảnh hưởng, bước kiểm thử trong PR.

Cảm ơn bạn đã quan tâm tới Second-hand Web VietNam!
