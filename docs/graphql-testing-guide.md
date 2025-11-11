# Hướng dẫn Kiểm thử GraphQL – 4 Chức Năng Cốt Lõi

Tài liệu này tập trung duy nhất vào bốn luồng nghiệp vụ quan trọng nhất của nền tảng:

1. Đăng ký tài khoản mới (Register)
2. Đăng nhập và xác thực phiên (Login + Me)
3. Duyệt và lọc sản phẩm (Product Browsing)
4. Xem chi tiết sản phẩm và thao tác giỏ hàng (Product Detail + Cart)

Mỗi phần liệt kê chi tiết tiền điều kiện, truy vấn/mutation GraphQL **đang chạy trong schema hiện tại**, dữ liệu mẫu, kết quả mong đợi, lỗi thường gặp và gợi ý tự động hóa.

---

## Chuẩn bị chung

- **Endpoint**: `http://localhost:4000/graphql`
  - Dịch vụ phải được khởi động qua `./start.sh` hoặc docker-compose trước khi test.
- **Công cụ khuyến nghị**:
  - GraphQL Playground (đã tích hợp sẵn khi chạy gateway NestJS).
  - Hoặc dùng CLI thông qua `curl`, `HTTPie`, `graphql-request`, `Postman`.
- **Tài khoản test sẵn có**:
  - Admin: `admin@studio.local` / mật khẩu `111111`
  - User: `namnamnamaa8@gmail.com` / mật khẩu `111111`
- **Header mặc định**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer <jwt_token>"
  }
  ```
  - Chỉ thêm `Authorization` sau khi lấy token từ mutation `login` hoặc `register`.
- **Cách đặt header trên GraphQL Playground**:
  ```json
  {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
  Nhấn nút `HTTP HEADERS` (hoặc biểu tượng dấu ngoặc `{}`) ở góc dưới bên trái và lưu lại để các request tiếp theo tự động sử dụng.

---

## 1. Đăng ký tài khoản mới (Register)

### 1.1 Mục tiêu & tiền điều kiện

- Tạo được tài khoản mới và nhận về `access_token` hợp lệ kèm thông tin user.
- Hệ thống phải đang bật dịch vụ Auth (`AUTH_SERVICE`) và User (`USER_SERVICE`), vì gateway sẽ gọi lần lượt hai service này.
- Sử dụng email chưa tồn tại trong hệ thống. Có thể tạo nhanh bằng cách gắn timestamp vào local-part (ví dụ: `qa.register+20240614@example.com`).

### 1.2 Mutation đăng ký

```graphql
mutation {
  register(
    input: {
      email: "qa.register+20240614@example.com"
      password: "ValidPass#123"
      name: "QA Register"
    }
  ) {
    access_token
    user {
      id
      email
      name
      avatar
      isAdmin
    }
  }
}
```

Phản hồi thành công mẫu:

```json
{
  "data": {
    "register": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "665f6b6af6a4c7f2f5e3dabc",
        "email": "qa.register+20240614@example.com",
        "name": "QA Register",
        "avatar": null,
        "isAdmin": false
      }
    }
  }
}
```

### 1.3 Trường hợp kiểm thử chi tiết

| Case | Biến đầu vào | Kết quả mong đợi | Lưu ý |
|------|--------------|------------------|-------|
| Thành công | Email mới, mật khẩu mạnh (`>= 8` ký tự gồm chữ hoa, thường, số, ký tự đặc biệt) | Trả về `access_token` không rỗng, trường `user` chứa `id` dạng ObjectId | Sau khi có token, nên lưu lại để dùng cho các phần test tiếp theo |
| Email trùng | Dùng lại email đã đăng ký | GraphQL trả `errors[0].message = "Register failed (409)"`, `data.register = null` | Lỗi đến từ Auth service, kiểm tra log `auth-service` để xác nhận mã lỗi HTTP 409 |
| Mật khẩu yếu | Mật khẩu ngắn hoặc thiếu ký tự đặc biệt | Tùy validation của Auth service, thường trả `Register failed (400)` | Không nhận token; đảm bảo backend đã bật validate |
| Email sai định dạng | `invalid-email` | GraphQL báo lỗi 400 | Playground highlight biến đỏ, backend vẫn trả lỗi `Register failed (400)` |

### 1.4 Gợi ý tự động hóa nhanh

```bash
EMAIL="qa.register.$(date +%s)@example.com"
curl -s http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d "$(cat <<EOF
{
  "query": "mutation { register(input: { email: \\"${EMAIL}\\", password: \\"ValidPass#123\\", name: \\"CLI Register\\" }) { access_token user { id email name isAdmin } } }"
}
EOF
)"
```

Xác minh token:

- Độ dài `access_token` > 100 ký tự.
- JWT payload có `sub` trùng với `data.register.user.id` (có thể decode nhanh bằng `jwt.io` hoặc `npx jwt-decode <token>`).

---

## 2. Đăng nhập và xác thực phiên (Login + Me)

### 2.1 Mục tiêu & tiền điều kiện

- Đảm bảo người dùng có thể đăng nhập, nhận token hợp lệ, gọi được query `me`.
- Kiểm tra cả hai biến thể: user thường và user admin (`isAdminLogin: true`).
- Các tài khoản mặc định:
  - User thường: `namnamnamaa8@gmail.com` / `111111`
  - Admin: `admin@studio.local` / `111111`

### 2.2 Mutation đăng nhập

```graphql
mutation {
  login(
    input: {
      email: "namnamnamaa8@gmail.com"
      password: "111111"
      isAdminLogin: false
    }
  ) {
    access_token
    user {
      id
      email
      name
      avatar
      isAdmin
    }
  }
}
```

Phản hồi thành công mẫu:

```json
{
  "data": {
    "login": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "665f65d5f6a4c7f2f5e3da11",
        "email": "namnamnamaa8@gmail.com",
        "name": "Nam QA",
        "avatar": null,
        "isAdmin": false
      }
    }
  }
}
```

### 2.3 Query `me` để xác thực token

```graphql
query Me {
  me {
    id
    email
    name
    avatar
    isAdmin
  }
}
```

- Bắt buộc set header `Authorization: Bearer <token>`.
- Kết quả mong đợi (với token user ở trên):

```json
{
  "data": {
    "me": {
      "id": "665f65d5f6a4c7f2f5e3da11",
      "email": "namnamnamaa8@gmail.com",
      "name": "Nam QA",
      "avatar": null,
      "isAdmin": false
    }
  }
}
```

### 2.4 Các kịch bản kiểm thử

| Case | Dữ liệu/biến | Kết quả mong đợi | Ghi chú |
|------|--------------|------------------|---------|
| User thường đăng nhập | Email user, mật khẩu chính xác | Trả về token + `isAdmin = false` | Dùng để test các chức năng cần token người dùng |
| Admin đăng nhập | Email admin, mật khẩu chính xác, `isAdminLogin: true` | Trả token + `isAdmin = true` | Nếu admin quên set `isAdminLogin`, vẫn login được nhưng `isAdmin` có thể `true/false` tùy profile |
| Admin flag sai | Gửi `isAdminLogin: true` với tài khoản user | GraphQL trả lỗi `Tài khoản không có quyền quản trị`, `data.login = null` | Lỗi được bắn từ resolver khi kiểm tra `isAdmin` |
| Sai mật khẩu | Password sai | GraphQL trả lỗi `Login failed (401)` | Không có data trả về ngoài `null` |
| Email không tồn tại | Quy ước email random | GraphQL trả lỗi `Login failed (404)` hoặc `Login failed (401)` tùy service | Nên ghi lại log để confirm code |
| Query `me` không token | Bỏ header Authorization | `data.me = null`, không có lỗi | Đảm bảo API không trả thông tin khi thiếu token |

### 2.5 Quản lý token & automation

Lưu token vào biến môi trường:

```bash
TOKEN="$(curl -s http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: { email: \"admin@studio.local\", password: \"111111\", isAdminLogin: true }) { access_token } }"}' \
  | jq -r '.data.login.access_token')"
```

Xác thực bằng query `me`:

```bash
curl -s http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"query":"{ me { id email isAdmin } }"}' | jq
```

---

## 3. Duyệt và lọc sản phẩm (Product Browsing)

### 3.1 Mục tiêu & dữ liệu chuẩn bị

- Đảm bảo người dùng (không cần đăng nhập) lấy được danh sách sản phẩm, danh mục.
- Kiểm tra luồng lọc theo danh mục server-side (`productsByCategory`) và lọc theo giá/từ khóa client-side.
- Yêu cầu hệ thống có dữ liệu sản phẩm. Có thể seed sample bằng script `init-mongo.js` hoặc các file JSON đi kèm.

### 3.2 Query lấy danh mục

```graphql
query Categories {
  categories {
    id
    name
    description
  }
}
```

Phản hồi mẫu:

```json
{
  "data": {
    "categories": [
      {
        "id": "665f620df6a4c7f2f5e3d9a1",
        "name": "Nội thất gỗ",
        "description": "Bàn ghế, tủ kệ bằng gỗ"
      },
      {
        "id": "665f621af6a4c7f2f5e3d9a2",
        "name": "Thiết bị gia đình",
        "description": null
      }
    ]
  }
}
```

- Dùng kết quả này để chọn `category` cho query tiếp theo.

### 3.3 Query `products`

```graphql
query Products {
  products {
    id
    name
    price
    stock
    categoryName
    image
    averageRating
    soldCount
  }
}
```

Phản hồi mẫu rút gọn:

```json
{
  "data": {
    "products": [
      {
        "id": "665f6320f6a4c7f2f5e3da41",
        "name": "Bàn gỗ cao su 1m6",
        "price": 2500000,
        "stock": 12,
        "categoryName": "Nội thất gỗ",
        "image": "https://cdn.example.com/products/table.jpg",
        "averageRating": 4.6,
        "soldCount": 37
      },
      {
        "id": "665f633df6a4c7f2f5e3da42",
        "name": "Ghế sofa vải xanh",
        "price": 3200000,
        "stock": 5,
        "categoryName": "Nội thất gỗ",
        "image": null,
        "averageRating": 4.2,
        "soldCount": 18
      }
    ]
  }
}
```

### 3.4 Query lọc theo danh mục

```graphql
query {
  productsByCategory(category: "665f620df6a4c7f2f5e3d9a1") {
    id
    name
    price
    stock
    category
    categoryName
  }
}
```

Kỳ vọng:

- Tất cả sản phẩm trả về có `categoryId` trùng ID đầu vào (hoặc `category` nếu backend trả dạng string).
- Số lượng sản phẩm <= tổng trả về từ query `products`.
- Không trả lỗi khi danh mục không có sản phẩm (kết quả là `[]`).

### 3.5 Lọc giá và tìm kiếm client-side

Hiện tại schema không nhận tham số `minPrice`, `maxPrice`, `search`. Có thể lọc bằng script sau khi lấy dữ liệu:

```javascript
// Chạy trong console của Playground hoặc đính kèm vào automation
const products = data.products;
const filtered = products
  .filter((p) => p.price >= 1000000 && p.price <= 3000000)
  .filter((p) => p.name.toLowerCase().includes("gỗ"));

console.log(`Tìm thấy ${filtered.length} sản phẩm thỏa điều kiện`);
```

Checklist kiểm thử:

| Điều kiện | Cách thực hiện | Kỳ vọng |
|-----------|----------------|---------|
| Lọc theo giá | Áp dụng script lọc giá như trên | Không sản phẩm nào có `price` ngoài khoảng quy định |
| Tìm kiếm tên | Dùng `includes()` hoặc regex để dựng bộ lọc tên | Kết quả chứa keyword, không phân biệt hoa thường |
| Lọc kết hợp | Lồng nhiều `filter()` | Danh sách cuối cùng đồng thời thỏa tất cả điều kiện |

### 3.6 Số liệu bổ sung cần ghi nhận

- Tổng số sản phẩm trả về (`products.length`).
- Thời gian phản hồi (Playground hiển thị ở footer, hoặc xem header `x-response-time` nếu có).
- Tỷ lệ sản phẩm thiếu `stock` hoặc `image`.
- Nếu có caching, nên gọi lại query sau khi seed thêm dữ liệu để đảm bảo dữ liệu cập nhật.

---

## 4. Chi tiết sản phẩm và thao tác giỏ hàng (Product Detail + Cart)

### 4.1 Mục tiêu & tiền điều kiện

- Lấy được thông tin sản phẩm chi tiết bằng `product(id: String!)`.
- Thêm, cập nhật, xóa sản phẩm trong giỏ thông qua `addToCart`, `updateCartItem`, `removeFromCart`, `cart`.
- Nên sử dụng token của user đăng nhập (giỏ hàng gắn với user). Nếu không có token, resolver dùng `guest` làm `userId`, vẫn thêm được nhưng khó kiểm soát.
- Xác định sẵn `productId` hợp lệ thông qua query `products`.

### 4.2 Query chi tiết sản phẩm

```graphql
query {
  product(id: "665f6320f6a4c7f2f5e3da41") {
    id
    name
    description
    price
    stock
    images
    categoryName
    brand
    averageRating
    reviewCount
    reviews {
      reviewId
      star
      reviewerName
      content
      time
    }
  }
}
```

Phản hồi mẫu (rút gọn):

```json
{
  "data": {
    "product": {
      "id": "665f6320f6a4c7f2f5e3da41",
      "name": "Bàn gỗ cao su 1m6",
      "description": "Bàn gỗ tự nhiên, đã xử lý chống mối mọt.",
      "price": 2500000,
      "stock": 12,
      "images": [
        "https://cdn.example.com/table-1.jpg",
        "https://cdn.example.com/table-2.jpg"
      ],
      "categoryName": "Nội thất gỗ",
      "brand": "LuxHome",
      "averageRating": 4.6,
      "reviewCount": 8,
      "reviews": [
        {
          "reviewId": 1201,
          "star": 5,
          "reviewerName": "Nguyễn A",
          "content": "Bàn chắc chắn, đúng mô tả.",
          "time": "2024-05-02T08:15:00.000Z"
        }
      ]
    }
  }
}
```

Trường hợp `id` không tồn tại: `data.product = null`, không có lỗi.

### 4.3 Mutation giỏ hàng

#### 4.3.1 Thêm sản phẩm vào giỏ

```graphql
mutation {
  addToCart(
    input: {
      productId: "665f6320f6a4c7f2f5e3da41"
      quantity: 2
    }
  ) {
    id
    productId
    quantity
    unitPrice
    product {
      id
      name
      price
      stock
    }
  }
}
```

Phản hồi mẫu:

```json
{
  "data": {
    "addToCart": {
      "id": "cart-665f6b6af6a4c7f2f5e3db11",
      "productId": "665f6320f6a4c7f2f5e3da41",
      "quantity": 2,
      "unitPrice": 2500000,
      "product": {
        "id": "665f6320f6a4c7f2f5e3da41",
        "name": "Bàn gỗ cao su 1m6",
        "price": 2500000,
        "stock": 12
      }
    }
  }
}
```

#### 4.3.2 Cập nhật số lượng

```graphql
mutation {
  updateCartItem(
    id: "cart-665f6b6af6a4c7f2f5e3db11"
    input: { quantity: 1 }
  ) {
    id
    quantity
    unitPrice
  }
}
```

Kết quả mong đợi: `quantity` cập nhật đúng, `unitPrice` giữ nguyên.

#### 4.3.3 Xóa item khỏi giỏ

```graphql
mutation {
  removeFromCart(id: "cart-665f6b6af6a4c7f2f5e3db11")
}
```

- Trả về `true` nếu xóa thành công.
- Nếu ID không tồn tại, resolver vẫn có thể trả `false` hoặc ném lỗi (kiểm tra log để xác nhận hành vi hiện tại).

#### 4.3.4 Xem toàn bộ giỏ

```graphql
query Cart {
  cart {
    id
    productId
    quantity
    unitPrice
    product {
      id
      name
      price
    }
    updatedAt
  }
}
```

Phản hồi mẫu:

```json
{
  "data": {
    "cart": [
      {
        "id": "cart-665f6b6af6a4c7f2f5e3db11",
        "productId": "665f6320f6a4c7f2f5e3da41",
        "quantity": 1,
        "unitPrice": 2500000,
        "product": {
          "id": "665f6320f6a4c7f2f5e3da41",
          "name": "Bàn gỗ cao su 1m6",
          "price": 2500000
        },
        "updatedAt": "2024-06-14T09:25:13.000Z"
      }
    ]
  }
}
```

- Tự tính tổng tiền: `cart.reduce((sum, item) => sum + item.quantity * (item.unitPrice || item.product?.price || 0), 0)`
- Nếu token thay đổi (user khác), giỏ mới phải độc lập.

### 4.4 Kịch bản kiểm thử chi tiết

| Case | Thao tác | Kết quả mong đợi | Lưu ý |
|------|----------|------------------|-------|
| Thêm giỏ hợp lệ | `addToCart` với số lượng phù hợp tồn kho | Trả về item với `quantity` bằng input | Đảm bảo `product.productId` khớp |
| Thêm vượt tồn kho | Quantity lớn hơn `stock` | Tùy service, có thể trả lỗi `400` (nếu backend kiểm tra) hoặc chấp nhận | Kiểm tra thực tế bằng cách xem log và query `cart` |
| Cập nhật số lượng | `updateCartItem` về 1 | Item cập nhật, không tạo bản ghi mới | So sánh `id` trước sau |
| Xóa item | `removeFromCart` | Trả `true` và item không còn trong `cart` | Nếu trả `false`, verify service xử lý ra sao |
| Xem giỏ khi chưa login | Bỏ header Authorization | Resolver dùng userId `guest`, trả về giỏ mặc định (thường rỗng) | Lưu ý khi automation cần so sánh kết quả |

### 4.5 Kịch bản end-to-end gợi ý

1. Đăng ký user mới → lưu token.
2. Dùng token gọi `products` để chọn sản phẩm có `stock > 0`.
3. Thêm sản phẩm vào giỏ hai lần và kiểm tra `quantity` được cộng dồn.
4. Cập nhật `quantity` xuống 1, xác nhận `cart` phản hồi đúng.
5. Gọi `removeFromCart`, đảm bảo giỏ trống.
6. Gọi lại `product(id)` để chắc chắn thông tin sản phẩm không thay đổi sau thao tác giỏ.

Ghi log lại toàn bộ response để đối chiếu khi cần debug, đặc biệt là các trường hợp lỗi HTTP được đóng gói thành thông điệp `"... failed (status)"`.

---

## 5. Tài liệu hóa & báo cáo

### 5.1 Ghi nhận kết quả GraphQL

- **Log kết quả**: lưu JSON response của từng bước vào thư mục `log/graphql/<ngày>.json`.
- **Theo dõi hiệu năng**: ghi chú thời gian phản hồi hiển thị ở Playground; nếu > 1 giây cần đánh dấu kiểm tra.
- **Kiểm soát dữ liệu test**: dọn dẹp tài khoản/giỏ hàng sau khi test bằng mutation `removeFromCart` hoặc script backend để tránh ô nhiễm dữ liệu.
- **Tự động hóa**: gom các ví dụ `curl` ở trên vào shell script (ví dụ `scripts/graphql-smoke.sh`) để chạy định kỳ và cảnh báo khi có lỗi.

Tài liệu đến đây đã bao phủ đầy đủ bốn chức năng trọng tâm với các ví dụ GraphQL tương ứng với schema hiện tại. Khi backend bổ sung thêm tham số lọc hoặc thay đổi response, cập nhật lại từng section tương ứng để đảm bảo test case luôn bám sát thực tế.

### 5.2 Kiểm thử với Selenium (Bản Word)

Phần này mô tả cách lấy kết quả từ bộ test Selenium trong thư mục `tests/e2e` và đóng gói thành tài liệu Word gửi cho Product/Stakeholder. Nội dung được viết theo định dạng “bản Word” nhằm giúp QA copy/paste nguyên khối sang file `.docx` mà vẫn giữ được cấu trúc báo cáo.

#### 5.2.1 Mục tiêu & phạm vi tài liệu Word

- Bao phủ bốn luồng UI đã định nghĩa trong phần đầu tài liệu: Đăng ký (`tests/e2e/test_registration.py`), Đăng nhập (`test_login.py`), Duyệt & lọc sản phẩm (`test_product_listing.py`), Chi tiết + giỏ hàng (`test_product_detail.py`).
- Phản ánh trung thực trạng thái pass/fail thực tế: các test đang dùng `pytest.fail(...)` cho bug-known sẽ được ghi rõ mã lỗi (BUG-REG-xxx, BUG-PROD-xxx...). Khi copy sang Word cần giữ nguyên mã để bám sát backlog.
- Ghi lại bằng chứng: log `pytest`, link GraphQL tương ứng, ảnh chụp màn hình, ID tài khoản seed, thông tin sản phẩm/giỏ hàng đã thao tác.
- Kết quả cuối cùng: 01 file `QA-Selenium-Report-<ngày>.docx` đặt trong `docs/reports/`.

#### 5.2.2 Chuẩn bị môi trường chạy Selenium

- **Hệ thống dịch vụ**: bật API Gateway tại `http://localhost:4000`, Frontend React tại `http://localhost:9002`, và đảm bảo MongoDB chứa dữ liệu seed (script `init-mongo.js` hoặc docker-compose đã chạy).
- **Tài khoản seed**: tái sử dụng hai tài khoản cố định ở phần 2 hoặc đăng ký nhanh bằng script helper trong `tests/e2e/conftest.py::_register_user`. Khi cần đảm bảo tính lặp lại, đặt biến `PYTEST_PRODUCT_SLUG` trỏ tới slug sản phẩm cố định.
- **Môi trường Python**:
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt  # nếu chưa có, tối thiểu: pytest selenium requests
  ```
- **Thiết lập Selenium**:
  - Chạy local: cài Chrome/Chromium + `chromedriver` tương thích.
  - Chạy qua Selenium Grid: chuẩn bị URL ví dụ `http://localhost:4444/wd/hub` và truyền bằng `--selenium-remote`.
  - Dùng tham số `--headed` khi cần ghi hình hoặc quan sát trực tiếp.
- **Thông số pytest khuyến nghị**:
  ```bash
  pytest -m selenium tests/e2e \
    --base-url http://localhost:9002 \
    --api-url http://localhost:4000 \
    --slow-mo 0.3 \
    --headed
  ```
  - `--slow-mo` sẽ chèn delay giữa các thao tác để chụp hình chính xác.
  - `--keep-browser` giữ cửa sổ mở để QA kiểm chứng trạng thái sau test.

#### 5.2.3 Thu thập log & artefact

- Kết hợp `tee` để lưu log:
  ```bash
  pytest -m selenium tests/e2e -s | tee logs/selenium_$(date +%Y%m%d_%H%M).log
  ```
- Bật `pytest --maxfail=1` nếu muốn dừng ngay khi phát hiện bug-blocker.
- Đối với mỗi luồng, chụp ảnh màn hình và lưu vào `logs/screenshots/<luồng>/<case>.png`. Đặt tên gắn với mã test (`TC_F01_11_register_success.png`) để khi đưa vào Word có thể truy ngược source.
- Thu API trace: mở DevTools (tab Network) và lưu HAR khi thực hiện luồng UI; đính kèm vào thư mục `logs/network/`.
- Ghi chú dữ liệu phát sinh (email auto, mã đơn hàng) vào `logs/selenium_notes.md` để dùng lại cho phần phụ lục Word.

#### 5.2.4 Cấu trúc chương trong file Word

1. **Trang bìa**: Tên dự án “Second-hand-Web-VietNam”, phạm vi “Báo cáo UI Automation – Selenium”, ngày chạy, người thực hiện.
2. **Tóm tắt điều hành**: bảng nhỏ trạng thái Pass/Fail cho 4 luồng chính, highlight các bug blocker.
3. **Thiết lập môi trường**: copy mục 5.2.2 (có thể rút gọn) và liệt kê phiên bản trình duyệt, Selenium, commit backend/frontend.
4. **Kết quả chi tiết theo luồng**: mỗi luồng một subsection gồm:
   - Bảng test case (tham khảo 5.2.5).
   - Screenshot đính kèm và mô tả.
   - Liên kết API GraphQL được gọi (ví dụ mutation `register`, query `me`, `products`, `addToCart`).
5. **Phân tích lỗi & đề xuất**: gom các case `pytest.fail` cùng mã bug, trạng thái hiện tại, đề xuất fix.
6. **Phụ lục**: log snippet (5–10 dòng quan trọng), HAR link, biến môi trường, danh sách tài khoản được tạo.

#### 5.2.5 Mapping test Selenium ↔ module GraphQL

- **Đăng ký (`test_registration.py`)**:
  - UI: trang `/register`.
  - API hỗ trợ: `register` mutation, REST fallback `/auth/register`.
  - Điểm lưu ý: các case BUG-REG-0xx cần screenshot phần lỗi hiển thị, ghi rõ token có trả về hay không.
- **Đăng nhập (`test_login.py`)**:
  - UI: `/login`.
  - API: `login` mutation, query `me`.
  - Khi phát hiện BUG-LOGIN-010/011 liên quan thông báo lỗi, chụp DevTools Network để chứng minh response 500/401.
- **Danh sách sản phẩm (`test_product_listing.py`)**:
  - UI: `/products`.
  - API: query `products`, `categories`, custom REST nếu có.
  - Các lỗi filter (BUG-PROD-016/020/024) nên có 2 ảnh trước-sau và trích response GraphQL không khớp.
- **Chi tiết & giỏ hàng (`test_product_detail.py`)**:
  - UI: `/products/<slug>`, `/cart`, `/checkout`.
  - API: query `product`, mutations `addToCart`, `removeFromCart`.
  - BUG-DETAIL-005/006 cần bằng chứng so sánh giữa UI và dữ liệu GraphQL để Product dễ đối chiếu.

Trong Word, dùng bảng chuẩn hóa sau cho mỗi module:

| Test ID (pytest) | Bước thực hiện | API GraphQL liên quan | Kết quả mong đợi | Kết quả thực tế | Bug ID / Ticket | Minh chứng |
|------------------|----------------|------------------------|------------------|-----------------|-----------------|------------|
| TC_F01.11 | Điền form hợp lệ → Submit | `register` | Điều hướng về `/` + token lưu | Thành công | - | `register_success.png` |
| TC_F02.10 | Nhập mật khẩu sai | `login` | Hiển thị lỗi “Sai mật khẩu” | Không có thông báo | BUG-LOGIN-009 | `login_wrong_password.png`, log dòng 45 |

Sao chép bảng vào Word sẽ giữ định dạng, chỉ cần cập nhật cột “Kết quả thực tế”, “Minh chứng”.

#### 5.2.6 Checklist hoàn thiện báo cáo

- [ ] Đã chạy `pytest -m selenium tests/e2e` ở commit mới nhất của frontend & backend.
- [ ] Đã đồng bộ trạng thái pass/fail trong bảng Word với output `pytest` (bao gồm mã bug).
- [ ] Toàn bộ screenshot kiểm tra hiển thị rõ UI, đặt đúng thư mục.
- [ ] Đã đính kèm log `.log`, file HAR, và ghi chú dữ liệu phát sinh.
- [ ] Đã cập nhật phần “Phân tích lỗi & đề xuất” dựa trên các BUG-* hiện diện.
- [ ] Đặt tên file đúng chuẩn `QA-Selenium-Report-YYYYMMDD.docx` và lưu vào `docs/reports/`.

Sau mỗi vòng regression, chỉ cần cập nhật lại log + bảng test case và export phiên bản Word mới. Giữ lịch sử file `.docx` để tiện đối chiếu tiến độ khắc phục bug giữa các sprint.
