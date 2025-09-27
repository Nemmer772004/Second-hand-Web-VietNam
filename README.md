# Second-hand Web VietNam

## Tổng quan
- Nền tảng thương mại điện tử cho thị trường đồ đã qua sử dụng tại Việt Nam.
- Bao gồm website bán hàng dành cho người dùng cuối, trang quản trị nội bộ và cụm microservice xử lý nghiệp vụ.
- Kiến trúc tách biệt bổ trợ việc mở rộng mô-đun, triển khai độc lập và tích hợp với các dịch vụ AI gợi ý sản phẩm.

## Thành phần chính
- **frontend/** – Ứng dụng Next.js 14 (App Router) phục vụ khách hàng, tích hợp Apollo Client để truy cập GraphQL gateway.
- **admin/** – Ứng dụng Next.js 13 riêng biệt cho quản trị viên với các trang thống kê đơn hàng, người dùng, sản phẩm.
- **backend/api-gateway/** – Gateway GraphQL xây dựng bằng NestJS, tổng hợp dữ liệu từ microservice qua cơ chế Nest Microservices transport TCP và REST fallback.
- **backend/services/** – Tập hợp microservice theo domain (product, category, order, user, cart, auth, ai) sử dụng NestJS + MongoDB/Mongoose.
- **docker-compose.yml** – Mô tả deployment cục bộ: MongoDB, gateway, admin, frontend và từng service.
- **docs/architecture.md** – Tài liệu kiến trúc chi tiết.

## Công nghệ sử dụng
- **Frontend & Admin**: Next.js, React 18, Apollo Client, TailwindCSS, Radix UI, React Hook Form, Zod.
- **Backend**: NestJS (GraphQL, Microservices), MongoDB/Mongoose, class-validator, RxJS.
- **AI & Recommendation**: Google Genkit SDK, tích hợp tại frontend/ai và service ai-service.
- **Hạ tầng & DevOps**: Yarn Workspaces, Docker & Docker Compose, Concurrently scripts, môi trường cấu hình qua `.env`.

## Kiến trúc & luồng dữ liệu
1. Người dùng truy cập frontend (cổng 9002) hoặc admin (cổng 3005).
2. Các ứng dụng Next.js gọi GraphQL Gateway tại `http://localhost:4000/graphql` hoặc các REST endpoint chuyên biệt.
3. Gateway xác thực (JWT) và điều phối request tới từng microservice qua transport TCP hoặc HTTP nội bộ.
4. Microservice truy cập MongoDB và trả về dữ liệu; Gateway tổng hợp rồi phản hồi cho client.
5. Một số tác vụ (gợi ý sản phẩm, đồng bộ catalog) được thực thi bất đồng bộ thông qua ai-service và các worker nội bộ.

## Cấu trúc thư mục (rút gọn)
```
.
├── admin/
├── backend/
│   ├── api-gateway/
│   └── services/
│       ├── product-service/
│       ├── category-service/
│       ├── order-service/
│       ├── user-service/
│       ├── cart-service/
│       ├── auth-service/
│       └── ai-service/
├── frontend/
├── docs/
├── docker-compose.yml
├── init-mongo.js
├── start.sh / stop.sh
└── README.md
```

## Thiết lập môi trường
1. Cài Node.js >= 18 và Yarn (hoặc npm).
2. Từ root: `yarn install` để cài đặt phụ thuộc cho toàn bộ workspace.
3. Sao chép file biến môi trường mẫu và cập nhật thông tin thật:
   - `cp admin/.env.example admin/.env`
   - Tạo các file `.env` tương tự cho frontend và các service (xem ghi chú trong từng `.env.example` nếu có).
4. Thiết lập MongoDB và các dịch vụ phụ trợ khác (RabbitMQ, email, v.v. nếu được dùng trong môi trường của bạn).

## Chạy dự án (development)
### Bằng Yarn
```bash
# Cài phụ thuộc một lần
yarn install

# Mở từng cửa sổ terminal:
yarn workspace api-gateway start:dev
# Trong cửa sổ khác, chạy các service cần thiết
yarn workspace product-service start:dev
yarn workspace category-service start:dev
yarn workspace order-service start:dev
yarn workspace user-service start:dev
yarn workspace cart-service start:dev
# Frontend và admin
yarn workspace frontend dev
yarn workspace luxhome-admin dev
```
> Lưu ý: một số service (auth, ai, …) có thể cần cấu hình bổ sung trước khi chạy.

### Bằng Docker Compose
```bash
docker compose up --build
```
Các cổng mặc định: MongoDB 27017, API Gateway 4000, Frontend 9002, Admin 3005, các service 3001–3007.

## Scripts hữu ích
- `yarn build` – Build toàn bộ workspace.
- `yarn workspace <tên-service> lint` – Chạy lint cho từng module NestJS.
- `start.sh` / `stop.sh` – Mẫu script khởi động/dừng cụm dịch vụ bằng Docker.

## Ghi chú triển khai
- Không commit các file `.env`; sử dụng các file `.env.example` và biến môi trường của hệ thống CI/CD.
- Thay thế các chuỗi kết nối MongoDB mẫu trong `docker-compose.yml` bằng secret thật trước khi triển khai.
- Theo dõi file `docs/architecture.md` để cập nhật khi thay đổi luồng dữ liệu hoặc công nghệ.

## Tài liệu bổ sung
- `docs/architecture.md` – mô tả chi tiết kiến trúc, data flow, và các microservice.
- `frontend/README`, `backend/**/README` (nếu có) – hướng dẫn chuyên biệt cho từng module.

---
Đóng góp vui lòng tạo nhánh mới, mở pull request và mô tả rõ thay đổi cùng các bước kiểm thử.
