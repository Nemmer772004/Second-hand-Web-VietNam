# Selenium End-to-End Test Suite

This folder contains a pytest/Selenium harness that automates the main user flows for Home Harmony:

- Đăng ký / đăng nhập người dùng
- Duyệt & lọc sản phẩm
- Xem chi tiết sản phẩm và thêm vào giỏ
- Quản lý giỏ hàng
- Đặt hàng (checkout)

## 1. Yêu cầu môi trường

| Thành phần | Ghi chú |
| --- | --- |
| Python 3.11+ | Cài đặt trên máy kiểm thử |
| Google Chrome/Chromium hoặc Firefox | Selenium sẽ điều khiển trình duyệt này |
| ChromeDriver/GeckoDriver tương ứng | Hoặc sử dụng Selenium Grid (`selenium/standalone-chrome`) |
| Các service của dự án | Khởi động bằng `docker compose -p studio up -d` |
| Dữ liệu Mongo demo | Chạy script seed (20 sản phẩm, user demo) trước khi test |

Cài đặt thư viện:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-test.txt
```

## 2. Biến môi trường hữu ích

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `SELENIUM_BASE_URL` | `http://localhost:9002` | URL frontend khách hàng |
| `SELENIUM_ADMIN_URL` | `http://localhost:3005` | URL admin (nếu cần) |
| `SELENIUM_API_URL` | `http://localhost:4000` | GraphQL Gateway (dùng cho tiện ích mở rộng) |
| `SELENIUM_BROWSER` | `chrome` | Chọn `chrome` hoặc `firefox` |
| `SELENIUM_REMOTE_URL` | *(rỗng)* | URL Selenium Grid, ví dụ `http://localhost:4444/wd/hub` |

## 3. Chạy test

```bash
pytest tests/selenium -m selenium
```

Tùy chọn đánh dấu ca cụ thể:

```bash
pytest tests/selenium/test_checkout.py -k success -m selenium
```

Nếu dùng Selenium Grid trong Docker Compose, thêm service:

```yaml
dev-selenium:
  image: selenium/standalone-chrome:latest
  shm_size: 2gb
  ports:
    - "4444:4444"
```

Sau đó đặt `SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub` trước khi chạy pytest.

## 4. Lưu ý khi test

1. Suite sử dụng dữ liệu mẫu đã seed (user `namnamnamaa8@gmail.com` / `111111`). Đảm bảo tài khoản này tồn tại.
2. Các ca đăng ký tạo email ngẫu nhiên (`homeharmony.<random>@example.com`). Kiểm tra và dọn dữ liệu nếu cần.
3. Một số ca còn đánh dấu TODO do bug đang mở (giỏ hàng không merge, alias slug). Khi bug được fix, cập nhật assertion tương ứng.
4. Khi test thất bại, Selenium sẽ để lại session đang mở. Hãy đóng trình duyệt thủ công hoặc dùng `pytest --maxfail=1`.

## 5. Cấu trúc thư mục

```
tests/
└── selenium/
    ├── config.py          # Đọc biến môi trường cấu hình
    ├── conftest.py        # Pytest fixtures (driver, dữ liệu)
    ├── pages/             # Page Object Model
    ├── utils/             # Generator dữ liệu, driver helpers
    └── test_*.py          # Bộ test theo chức năng
```

Bạn có thể mở rộng Page Object để bao phủ thêm phần admin hoặc các microservice khác khi cần.
