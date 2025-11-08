# ✅ Backend Deploy Checklist - Render Platform

## Chuẩn bị môi trường
- [ ] Tạo tài khoản Render tại https://render.com
- [ ] Kết nối Render với GitHub account
- [ ] Chuẩn bị MongoDB Atlas connection string
- [ ] Chuẩn bị Cloudinary credentials (nếu dùng upload ảnh)
- [ ] Tạo Gmail App Password (nếu dùng email service)

## Kiểm tra code
- [ ] Chạy `node pre-deploy-check.js` để kiểm tra cấu hình
- [ ] Đảm bảo `package.json` có script `"start": "node server.js"`
- [ ] Kiểm tra `.env.example` đầy đủ các biến cần thiết
- [ ] Test backend chạy local: `npm start`

## Push code lên GitHub
- [ ] Commit tất cả thay đổi
- [ ] Push lên GitHub repository
- [ ] Đảm bảo branch `main` có code mới nhất

## Tạo Web Service trên Render
- [ ] Vào https://dashboard.render.com
- [ ] Click **New** → **Web Service**
- [ ] Chọn repository chứa backend
- [ ] Cấu hình như sau:
  - **Name**: `group14-backend` (hoặc tên bạn chọn)
  - **Branch**: `main`
  - **Root Directory**: `server`
  - **Runtime**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Instance Type**: `Free`

## Cấu hình Environment Variables
Thêm các biến sau vào Render dashboard:

### Bắt buộc
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
PORT=3000
```

### Tuỳ chọn nhưng khuyến khích
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=https://your-frontend.vercel.app

# Cloudinary (nếu dùng upload ảnh)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Deploy
- [ ] Click **Create Web Service**
- [ ] Đợi build và deploy hoàn tất (5-10 phút)
- [ ] Kiểm tra logs để đảm bảo không có lỗi
- [ ] Ghi nhận URL backend được cấp (dạng: `https://xxx.onrender.com`)

## Kiểm tra sau deploy
- [ ] Test API health check: `https://xxx.onrender.com/api/users`
- [ ] Test đăng nhập: `POST /api/auth/login`
- [ ] Kiểm tra CORS với frontend
- [ ] Test upload ảnh (nếu có)
- [ ] Test gửi email (nếu có)

## Cập nhật Frontend
- [ ] Cập nhật `REACT_APP_API_URL` trong `.env.production` của client
- [ ] Redeploy frontend lên Vercel
- [ ] Test toàn bộ tính năng từ frontend đến backend

## Monitoring & Maintenance
- [ ] Thêm monitoring (Render có built-in)
- [ ] Cài đặt auto-deploy khi có push mới
- [ ] Theo dõi logs và performance
- [ ] Backup database định kỳ

---

## Lưu ý quan trọng
- **Free tier**: 750 giờ/tháng, ngủ sau 15 phút không có request
- **MongoDB**: Đảm bảo whitelist IP (cho phép tất cả IP: `0.0.0.0/0`)
- **CORS**: Frontend URL phải được thêm vào CORS whitelist
- **Security**: Không bao giờ commit file `.env` chứa thông tin nhạy cảm

## Lỗi thường gặp
| Lỗi | Cách khắc phục |
|-----|----------------|
| Build failed | Kiểm tra package.json, dependencies |
| Cannot connect to MongoDB | Kiểm tra connection string, whitelist IP |
| CORS error | Cập nhật FRONTEND_URL trong biến môi trường |
| JWT errors | JWT_SECRET phải ≥ 32 ký tự |
| Service sleeping | Normal cho free tier, sẽ wake up khi có request |

---

**Sau khi hoàn thành checklist này, backend của bạn sẽ được deploy thành công lên Render! 🎉**