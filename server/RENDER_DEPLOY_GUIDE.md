# Hướng Dẫn Deploy Backend lên Render

## Tổng quan
Hướng dẫn này sẽ giúp bạn deploy backend Node.js lên Render Platform, bao gồm các bước chuẩn bị, cấu hình và triển khai.

## Mục lục
1. [Chuẩn bị trước khi deploy](#1-chuẩn-bị-trước-khi-deploy)
2. [Tạo tài khoản Render](#2-tạo-tài-khoản-render)
3. [Chuẩn bị repository](#3-chuẩn-bị-repository)
4. [Deploy backend lên Render](#4-deploy-backend-lên-render)
5. [Cấu hình biến môi trường](#5-cấu-hình-biến-môi-trường)
6. [Kết nối với frontend](#6-kết-nối-với-frontend)
7. [Kiểm tra và xử lý lỗi](#7-kiểm-tra-và-xử-lý-lỗi)

---

## 1. Chuẩn bị trước khi deploy

### 1.1 Kiểm tra cấu hình package.json
Đảm bảo file `package.json` có các scripts sau:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 1.2 Chuẩn bị các dịch vụ bên ngoài
Bạn cần có các tài khoản và thông tin sau:

- **MongoDB Atlas**: Chuẩn bị connection string
- **Cloudinary**: Lấy thông tin API credentials (nếu dùng upload ảnh)
- **Gmail**: Tạo App Password nếu dùng email service

### 1.3 Kiểm tra file .env.example
File `.env.example` đã có sẵn với các biến cần thiết:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Port
PORT=3000

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=your-gmail-address@gmail.com

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3001

# Cloudinary Configuration (for avatar upload)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcd1234
```

---

## 2. Tạo tài khoản Render

### 2.1 Đăng ký tài khoản
1. Truy cập: https://render.com
2. Click **"Sign Up"** và đăng ký bằng GitHub hoặc email
3. Xác thực email nếu cần

### 2.2 Liên kết với GitHub
1. Sau khi đăng nhập, vào **Account Settings**
2. Kết nối với GitHub account của bạn
3. Cấp quyền cho Render truy cập repository

---

## 3. Chuẩn bị repository

### 3.1 Push code lên GitHub
```bash
# Kiểm tra trạng thái git
git status

# Add tất cả file (trừ node_modules)
git add .
git commit -m "Prepare for Render deployment"

# Push lên GitHub
git push origin main
```

### 3.2 Kiểm tra cấu trúc thư mục
Đảm bảo thư mục server có cấu trúc:
```
server/
├── package.json
├── server.js
├── .env.example
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
└── uploads/
```

---

## 4. Deploy backend lên Render

### 4.1 Tạo Web Service mới
1. Vào dashboard Render: https://dashboard.render.com
2. Click **"New"** → **"Web Service"**
3. Chọn repository chứa backend code của bạn
4. Nếu chưa thấy repo, click **"Configure account"** để cấp quyền

### 4.2 Cấu hình Web Service
Điền các thông tin sau:

| Field | Value | Ghi chú |
|-------|-------|---------|
| **Name** | `group14-backend` | Tên service của bạn |
| **Branch** | `main` | Hoặc `master` nếu dùng branch đó |
| **Root Directory** | `server` | Vì backend nằm trong thư mục server |
| **Runtime** | `Node` | Chọn Node.js |
| **Build Command** | `npm install` | Cài đặt dependencies |
| **Start Command** | `npm start` | Chạy server |
| **Instance Type** | `Free` | Chọn gói miễn phí |

### 4.3 Advanced configurations (tuỳ chọn)
- **Auto-deploy**: Bật để tự động deploy khi có push mới
- **Health Check Path**: Để trống hoặc `/api/health`

---

## 5. Cấu hình biến môi trường

### 5.1 Thêm Environment Variables
Trong mục **Environment Variables**, thêm các biến sau:

```env
# Bắt buộc
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_min_32_characters

# Email service (nếu dùng)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=your_email@gmail.com

# Cloudinary (nếu dùng upload ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (URL của frontend đã deploy)
FRONTEND_URL=https://your-frontend.vercel.app

# Port (Render sẽ tự động cấp PORT)
PORT=3000
```

### 5.2 Lưu ý quan trọng
- **JWT_SECRET**: Phải ít nhất 32 ký tự, dùng chuỗi ngẫu nhiên
- **MONGODB_URI**: Dùng connection string từ MongoDB Atlas
- **FRONTEND_URL**: Cập nhật với URL frontend đã deploy trên Vercel

---

## 6. Kết nối với frontend

### 6.1 Cập nhật frontend
Sau khi backend deploy thành công, Render sẽ cung cấp URL dạng:
```
https://group14-backend.onrender.com
```

### 6.2 Cập nhật file .env.production của client
```env
REACT_APP_API_URL=https://group14-backend.onrender.com/api
```

### 6.3 Redeploy frontend
```bash
# Trong thư mục client
npm run build
vercel --prod
```

---

## 7. Kiểm tra và xử lý lỗi

### 7.1 Kiểm tra logs
1. Vào Render dashboard
2. Click vào service của bạn
3. Xem **Logs** tab để kiểm tra trạng thái

### 7.2 Kiểm tra health check
Test các endpoint sau:
```bash
# Kiểm tra server chạy
curl https://group14-backend.onrender.com/api/users

# Kiểm tra auth
curl -X POST https://group14-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 7.3 Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách khắc phục |
|-----|-------------|----------------|
| **Build failed** | Thiếu dependencies | Kiểm tra package.json |
| **Cannot connect to MongoDB** | Sai connection string | Kiểm tra MONGODB_URI |
| **CORS error** | Sai FRONTEND_URL | Cập nhật biến môi trường |
| **JWT errors** | Secret quá ngắn | Tăng JWT_SECRET lên 32+ ký tự |

### 7.4 Script kiểm tra email config
Sử dụng script có sẵn để kiểm tra:
```bash
node check-email-config.js
```

---

## 8. Tối ưu và bảo mật

### 8.1 Security checklist
- [ ] JWT_SECRET phải dài và ngẫu nhiên
- [ ] Không expose sensitive data trong logs
- [ ] Enable rate limiting (đã có sẵn)
- [ ] CORS chỉ cho phép frontend domain

### 8.2 Performance
- [ ] Enable gzip compression
- [ ] Implement caching nếu cần
- [ ] Monitor database queries

---

## 9. Maintenance

### 9.1 Auto-deploy
Khi có code mới:
1. Push code lên GitHub
2. Render tự động pull và rebuild
3. Kiểm tra logs để đảm bảo deploy thành công

### 9.2 Manual deploy
Nếu cần deploy thủ công:
1. Vào Render dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 10. Hỗ trợ

### 10.1 Render documentation
- Official docs: https://render.com/docs
- Node.js deploy: https://render.com/docs/deploy-node-express-app

### 10.2 Kiểm tra trạng thái service
- Render status: https://status.render.com

---

## Tổng kết

Sau khi hoàn thành các bước trên, backend của bạn sẽ được deploy thành công với:
- ✅ Node.js server chạy ổn định
- ✅ Kết nối MongoDB Atlas
- ✅ API endpoints hoạt động
- ✅ Tích hợp với frontend đã deploy
- ✅ Email và upload ảnh (nếu cấu hình)

**URL Backend**: `https://group14-backend.onrender.com`
**API Base**: `https://group14-backend.onrender.com/api`

Nhớ cập nhật frontend với URL backend mới và kiểm tra toàn bộ tính năng!