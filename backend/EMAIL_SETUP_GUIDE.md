# Hướng dẫn cấu hình Gmail SMTP cho chức năng quên mật khẩu

## Bước 1: Chuẩn bị tài khoản Gmail
1. Đăng nhập vào tài khoản Gmail của bạn
2. Bật **Xác thực 2 yếu tố** (2FA) nếu chưa bật
   - Vào https://myaccount.google.com/
   - Chọn "Bảo mật" → "Xác thực 2 bước" → Bật

## Bước 2: Tạo App Password
1. Truy cập https://myaccount.google.com/apppasswords
2. Chọn "Ứng dụng khác" → Đặt tên là "Web App" hoặc "Node.js App"
3. Nhấn "Tạo" → Copy mật khẩu 16 ký tự (có dạng: abcd efgh ijkl mnop)

## Bước 3: Cập nhật file .env
Sửa file `.env` trong thư mục backend, thay thế các giá trị sau:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=your-gmail-address@gmail.com
FRONTEND_URL=http://localhost:3001
```

**Lưu ý:** Thay thế:
- `your-gmail-address@gmail.com` bằng địa chỉ Gmail thực tế của bạn
- `your-16-character-app-password` bằng mật khẩu ứng dụng 16 ký tự vừa tạo

## Bước 4: Kiểm tra cấu hình
Chạy lệnh test để kiểm tra:
```bash
node test-email.js
```

## Bước 5: Test chức năng thực tế
1. Khởi động lại server backend
2. Truy cập frontend, chọn "Quên mật khẩu"
3. Nhập email đã đăng ký trong hệ thống
4. Kiểm tra email thật để nhận link reset password

## Lưu ý quan trọng
- **An toàn**: Đừng chia sẻ file .env hoặc app password
- **Giới hạn**: Gmail có giới hạn 500 email/ngày cho tài khoản thường
- **Bảo mật**: Nếu dùng cho production, cân nhắc dùng dịch vụ email chuyên nghiệp như SendGrid, Mailgun
- **App Password**: Nếu đổi mật khẩu Gmail, cần tạo lại app password mới

## Troubleshooting
- **Lỗi 535**: Sai app password hoặc chưa bật 2FA
- **Lỗi 534**: Chưa bật truy cập ứng dụng kém an toàn
- **Không nhận email**: Kiểm tra spam folder