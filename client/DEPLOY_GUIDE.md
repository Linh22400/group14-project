# HƯỚNG DẪN DEPLOY FRONTEND LÊN VERCEL

## Bước 1: Chuẩn bị

1. **Tạo repository trên GitHub:**
   - Truy cập https://github.com/new
   - Tạo repository mới với tên `user-management-frontend`
   - Để ở chế độ Public hoặc Private tùy ý

2. **Push code lên GitHub:**
```bash
cd d:\group14-project\frontend
git init
git add .
git commit -m "Initial commit - User Management Frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/user-management-frontend.git
git push -u origin main
```

## Bước 2: Cấu hình biến môi trường

1. **Cập nhật file `.env.production`:**
   - Mở file `.env.production`
   - Thay `https://your-backend-domain.com/api` bằng URL backend thực tế của bạn

2. **Các service đã được cập nhật để sử dụng biến môi trường:**
   - `apiService.js` đã được cập nhật để sử dụng `process.env.REACT_APP_API_URL`
   - Các service khác cũng đã được cấu hình động

## Bước 3: Deploy trên Vercel

1. **Truy cập Vercel:**
   - Vào https://vercel.com
   - Đăng nhập bằng GitHub

2. **Import Project:**
   - Click "New Project"
   - Chọn repository `user-management-frontend`
   - Click "Import"

3. **Cấu hình Build Settings:**
```
Framework: React
Root Directory: ./ (không phải client/)
Output Directory: build
Install Command: npm install
Build Command: npm run build
```

4. **Thêm Environment Variables:**
   - Click "Environment Variables"
   - Add: `REACT_APP_API_URL = https://your-backend-domain.com/api`
   - Click "Add"

5. **Deploy:**
   - Click "Deploy"
   - Chờ 2-3 phút để build hoàn tất

## Bước 4: Kết quả

- Domain sẽ có dạng: `https://user-management-frontend-xyz123.vercel.app`
- Có thể đổi tên domain trong project settings nếu muốn

## Lưu ý quan trọng:

1. **Backend phải được deploy trước** để có URL điền vào `REACT_APP_API_URL`
2. **CORS phải được cấu hình** trên backend để cho phép domain frontend truy cập
3. **HTTPS là bắt buộc** cho production

## Troubleshooting:

- Nếu build fail: Kiểm tra lại dependencies trong `package.json`
- Nếu API không hoạt động: Kiểm tra lại `REACT_APP_API_URL` trong Environment Variables
- Nếu CORS error: Cấu hình CORS trên backend server