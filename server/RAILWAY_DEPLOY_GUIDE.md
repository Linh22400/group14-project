# Hướng Dẫn Deploy Backend lên Railway

## Tổng quan
Hướng dẫn này sẽ giúp bạn deploy backend Node.js lên Railway Platform.

## Các bước deploy

### 1. Chuẩn bị trước khi deploy
- Tạo tài khoản Railway tại https://railway.app
- Kết nối với GitHub account
- Chuẩn bị các thông tin:
  - MongoDB Atlas connection string
  - JWT secret (ít nhất 32 ký tự)
  - Gmail app password (nếu dùng email)
  - Cloudinary credentials (nếu dùng upload ảnh)
  - Frontend URL (sau khi deploy frontend)

### 2. Cấu hình Environment Variables
Trong Railway dashboard, thêm các biến môi trường:

```env
# Bắt buộc
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters

# Frontend URL (cập nhật sau khi deploy frontend)
FRONTEND_URL=https://your-frontend.vercel.app

# Email Configuration (nếu dùng)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="Your App Name" <your-email@gmail.com>

# Cloudinary (nếu dùng upload ảnh)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Deploy từ GitHub
1. Trong Railway dashboard, click "New Project"
2. Chọn "Deploy from GitHub repo"
3. Chọn repository chứa backend code
4. Railway sẽ tự động detect và deploy

### 4. Kiểm tra sau deploy
- Health check: `https://your-app.railway.app/health`
- API status: `https://your-app.railway.app/api/status`

### 5. Cập nhật CORS (nếu cần)
Server đã có cấu hình CORS dynamic cho Vercel deployments, nên không cần chỉnh sửa thêm.

### 6. Kết nối với Frontend
Sau khi deploy thành công:
1. Lấy Railway URL (dạng: `https://your-app.railway.app`)
2. Cập nhật `REACT_APP_API_URL` trong client `.env.production`:
   ```
   REACT_APP_API_URL=https://your-app.railway.app/api
   ```
3. Redeploy frontend với URL mới

## Lưu ý quan trọng
- Railway tự động cấp PORT qua biến môi trường
- Đảm bảo tất cả environment variables đều được thêm
- Kiểm tra logs trong Railway dashboard nếu gặp lỗi
- MongoDB Atlas cần whitelist IP (để 0.0.0.0/0 cho Railway)

## Troubleshooting
- Nếu build fail: kiểm tra `npm start` script
- Nếu database không kết nối: kiểm tra `MONGODB_URI`
- Nếu CORS error: kiểm tra `FRONTEND_URL` và CORS configuration