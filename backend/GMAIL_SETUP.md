# 📧 HƯỚNG DẪN CẤU HÌNH GMAIL CHO CHỨC NĂNG RESET PASSWORD

## 🎯 Mục tiêu
Chuyển từ Mailtrap sang Gmail để gửi email thật cho người dùng khi họ quên mật khẩu.

## ⚠️ QUAN TRỌNG - Đọc trước khi bắt đầu
- Không dùng mật khẩu Gmail thông thường
- Phải dùng **App Password** 16 ký tự
- Phải bật **Xác thực 2 yếu tố (2FA)** trước

## 🔐 BƯỚC 1: Bật Xác thực 2 yếu tố (2FA)

1. Đăng nhập Gmail của bạn
2. Truy cập: https://myaccount.google.com/security
3. Tìm mục **"Xác thực 2 bước"** → Nhấn **BẬT**
4. Làm theo hướng dẫn để thiết lập 2FA (có thể dùng số điện thoại hoặc Google Authenticator)

## 🔑 BƯỚC 2: Tạo App Password

1. Sau khi bật 2FA, truy cập: https://myaccount.google.com/apppasswords
2. Ở mục **"Chọn ứng dụng"** → Chọn **"Ứng dụng khác"**
3. Đặt tên: **"Web App"** hoặc **"Node.js Server"**
4. Nhấn **TẠO**
5. **COPY NGAY** mật khẩu 16 ký tự (có dạng: `abcd efgh ijkl mnop`)

## ⚙️ BƯỚC 3: Cập nhật file .env

Mở file `.env` trong thư mục `backend` và sửa các giá trị email:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com          # ← Thay bằng email của bạn
EMAIL_PASS=abcd efgh ijkl mnop           # ← Thay bằng app password 16 ký tự
EMAIL_FROM=your-email@gmail.com          # ← Thay bằng email của bạn
FRONTEND_URL=http://localhost:3001       # ← URL frontend (đã có sẵn)
```

### Ví dụ thực tế:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=shopcuatoi@gmail.com
EMAIL_PASS=xnrv ijqo qrst uvwx yzab
EMAIL_FROM=shopcuatoi@gmail.com
FRONTEND_URL=http://localhost:3001
```

## 🧪 BƯỚC 4: Test Email

Chạy lệnh test để kiểm tra:

```bash
cd d:\group14-project\backend
node test-email.js
```

### ✅ Kết quả đúng:
```
🔍 Testing Gmail SMTP configuration...
📧 Email config: { host: 'smtp.gmail.com', port: '587', ... }
📤 Sending test email to your-email@gmail.com...
✅ Email sent successfully!
📨 Message ID: <abc123@mail.gmail.com>
🔗 Test URL: http://localhost:3001/reset-password?token=test-token-...
💡 Kiểm tra email của bạn (cả spam folder)
```

### ❌ Lỗi thường gặp:

| Lỗi | Nguyên nhân | Cách khắc phục |
|-----|-------------|----------------|
| `535-5.7.8 Username and Password not accepted` | Sai app password hoặc chưa bật 2FA | Kiểm tra lại app password, đảm bảo đã bật 2FA |
| `534-5.7.14` | Google chặn đăng nhập | Vào https://www.google.com/accounts/DisplayUnlockCaptcha để mở khóa |

## 🚀 BƯỚC 5: Khởi động lại server

```bash
# Dừng server đang chạy (Ctrl+C)
npm start
```

## 🧪 BƯỚC 6: Test chức năng thực tế

1. Mở trình duyệt → Truy cập http://localhost:3001
2. Nhấn **"Quên mật khẩu"**
3. Nhập email đã đăng ký trong hệ thống
4. Kiểm tra email (cả **Spam/Junk folder**)

## 📋 Kiểm tra nhanh (Checklist)

- [ ] Đã bật 2FA trên Gmail
- [ ] Đã tạo app password 16 ký tự
- [ ] Đã cập nhật đúng email trong .env
- [ ] Đã cập nhật đúng app password trong .env
- [ ] Đã test thành công với `node test-email.js`
- [ ] Đã khởi động lại backend server

## 🔒 Lưu ý bảo mật

- **KHÔNG** chia sẻ file `.env` với ai
- **KHÔNG** dùng mật khẩu Gmail thật trong code
- Nếu thay đổi mật khẩu Gmail, phải tạo lại app password
- Giới hạn gửi: 500 email/ngày với Gmail thường

## 🆘 Khắc phục sự cố

### Email không đến?
1. Kiểm tra **Spam/Junk folder**
2. Kiểm tra app password đúng chưa
3. Kiểm tra 2FA đã bật chưa
4. Xem log server để biết lỗi chi tiết

### Cần hỗ trợ?
- Chụp ảnh lỗi từ terminal
- Kiểm tra lại từng bước trong hướng dẫn
- Đảm bảo đã làm đúng thứ tự các bước

---
**✨ Chúc bạn thành công! Email thật sẽ giúp người dùng nhận được thông báo reset password ngay lập tức!**