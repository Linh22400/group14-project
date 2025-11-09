# Multi-Platform Deployment Guide
## Railway + Render + Vercel

## 🚀 Backend URLs
- **Railway**: https://group14-project.railway.internal
- **Render**: https://group14-project-iyq7.onrender.com

## 📋 Environment Variables Checklist

### Backend (Railway & Render)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/groupDB
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this
FRONTEND_URL=https://group14-project-livid.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://group14-project.railway.internal  # Hoặc Render URL
```

## 🔧 Cấu hình CORS
Server đã được cấu hình để chấp nhận:
- Railway domains: `*.railway.app`, `*.up.railway.app`
- Render domains: `*.onrender.com`
- Vercel domains: `*.vercel.app`
- Local development: `localhost:3000`, `localhost:3001`

## 🔄 Switch giữa Railway và Render

### Option 1: Dùng Railway (Recommend)
1. Frontend: `REACT_APP_API_URL=https://group14-project.railway.internal`
2. Backend: Deploy trên Railway
3. Test: https://group14-project.railway.internal/health

### Option 2: Dùng Render
1. Frontend: `REACT_APP_API_URL=https://group14-project-iyq7.onrender.com`
2. Backend: Deploy trên Render
3. Test: https://group14-project-iyq7.onrender.com/health

## 🧪 Test Multi-Platform

### Test Railway:
```bash
curl https://group14-project.railway.internal/health
```

### Test Render:
```bash
curl https://group14-project-iyq7.onrender.com/health
```

### Test Frontend:
```bash
# Vercel
https://group14-project-livid.vercel.app
```

## 📱 Mobile Test
- Railway: https://group14-project.railway.internal
- Render: https://group14-project-iyq7.onrender.com

## ⚠️ Lưu ý
1. **Database**: Cả Railway và Render dùng chung MongoDB Atlas
2. **JWT Secret**: Phải giống nhau trên cả 2 platform
3. **CORS**: Server tự động chấp nhận cả 2 domain
4. **File Upload**: Dùng chung Cloudinary

## 🎯 Best Practices
- Luôn test health check trước khi deploy frontend
- Giữ JWT secret giống nhau trên mọi platform
- Monitor logs cả Railway và Render
- Backup database trước khi thay đổi lớn