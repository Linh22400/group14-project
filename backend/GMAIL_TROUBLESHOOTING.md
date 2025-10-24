# 🔧 KHẮC PHỤC LỖI GMAIL: 535-5.7.8

## 🚨 VẤN ĐỀ HIỆN TẠI

Bạn đang gặp lỗi: `535-5.7.8 Username and Password not accepted`

**Nguyên nhân**: Bạn chưa tạo App Password cho tài khoản Gmail

## 📱 HƯỚNG DẪN TẠO APP PASSWORD (2 phút)

### Bước 1: Bật 2FA (Nếu chưa bật)
1. Vào https://myaccount.google.com/
2. Click **Bảo mật** → **Xác minh 2 bước**
3. Bật xác minh 2 bước

### Bước 2: Tạo App Password
1. Vào https://myaccount.google.com/apppasswords
2. Chọn **Ứng dụng khác** → Đặt tên: `Project Password Reset`
3. Click **TẠO**
4. **COPY** 16 ký tự (vd: abcd efgh ijkl mnop)

### Bước 3: Cập nhật file `.env`
```env
EMAIL_PASS=abcd efgh ijkl mnop  # Dán 16 ký tự vừa tạo
```

## 🔍 KIỂM TRA LẠI

```bash
# 1. Kiểm tra cấu hình
node check-email-config.js

# 2. Test gửi email
node test-email.js
```

## ⚠️ LƯU Ý QUAN TRỌNG

- **KHÔNG** dùng password Gmail thường
- **KHÔNG** dùng password đã lưu trong trình duyệt
- **PHẢI** dùng 16 ký tự App Password

## 📞 NẾU VẪN LỖI

1. Vào https://accounts.google.com/DisplayUnlockCaptcha
2. Click **Tiếp tục**
3. Chạy lại `node test-email.js`

## 🎯 KẾT QUẢ MONG MUỐN

```
✅ Email gửi thành công!
📧 Kiểm tra email tại: ln32587@gmail.com
```

**⏰ Thời gian thực hiện: 2-3 phút**