# 🚀 Quick Deploy Guide - Backend to Render

## 1. Chuẩn bị (5 phút)
- [ ] Copy secret từ lệnh `node generate-jwt-secret.js` (dùng option Strong)
- [ ] Có MongoDB Atlas connection string sẵn
- [ ] Có GitHub repo cho backend

## 2. Cập nhật biến môi trường (2 phút)
Thêm vào Render dashboard:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=copy_from_generate_jwt_secret_output
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3000
```

## 3. Deploy (3 phút)
1. Vào https://render.com → New Web Service
2. Chọn backend repo
3. Cấu hình:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Thêm environment variables ở bước 2
5. Click **Create Web Service**

## 4. Kiểm tra (2 phút)
- [ ] Xem logs để đảm bảo deploy thành công
- [ ] Test API: `https://xxx.onrender.com/api/users`
- [ ] Cập nhật frontend với URL backend mới

**Tổng thời gian: ~12 phút** ⏱️

---

## Lưu ý nhanh
- **JWT_SECRET**: Phải ≥ 32 ký tự, random
- **MongoDB**: Whitelist IP `0.0.0.0/0`
- **Frontend URL**: Cập nhật sau khi deploy frontend
- **Free tier**: Server ngủ sau 15 phút không có request

## Lỗi thường gặp
| Lỗi | Fix |
|-----|-----|
| Build failed | Kiểm tra `npm start` script |
| MongoDB connection | Kiểm tra connection string |
| CORS error | Cập nhật `FRONTEND_URL` |

**Ready to deploy! 🎯**