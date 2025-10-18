# MongoDB Atlas Integration Guide

## Hướng dẫn tích hợp MongoDB Atlas cho dự án group14-project

### 1. Tạo MongoDB Atlas Account

1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký tài khoản miễn phí
3. Tạo Organization và Project mới

### 2. Tạo Cluster

1. Chọn "Build a Cluster"
2. Chọn "Shared" (miễn phí)
3. Chọn Cloud Provider (AWS/Google Cloud)
4. Chọn Region gần bạn nhất
5. Đặt tên cluster: "group14-cluster"

### 3. Tạo Database User

1. Vào Database Access → Add New Database User
2. Tạo username và password (ghi nhớ để dùng sau)
3. Chọn quyền: "Read and write to any database"

### 4. Tạo Database và Collection

1. Vào Collections → Add My Own Data
2. Database name: `groupDB`
3. Collection name: `users`

### 5. Lấy Connection String

1. Vào Clusters → Connect → Connect your application
2. Copy connection string (dạng): 
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/groupDB?retryWrites=true&w=majority
   ```
3. Thay `<username>` và `<password>` bằng thông tin thực tế

### 6. Cấu hình Backend

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Sửa file `.env`, thay thế bằng connection string thực tế:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/groupDB?retryWrites=true&w=majority
   PORT=3000
   ```

### 7. Cài đặt Dependencies

```bash
cd backend
npm install mongoose dotenv
```

### 8. Chạy Server

```bash
npm start
```

### 9. Kiểm tra API

#### GET tất cả users:
```bash
curl http://localhost:3000/api/users
```

#### POST tạo user mới:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Nguyễn Văn A", "email": "a@example.com"}'
```

#### PUT cập nhật user:
```bash
curl -X PUT http://localhost:3000/api/users/<user-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Nguyễn Văn B"}'
```

#### DELETE xóa user:
```bash
curl -X DELETE http://localhost:3000/api/users/<user-id>
```

### 10. Lưu ý quan trọng

- **Bảo mật**: Không bao giờ commit file `.env` lên git
- **Network Access**: Thêm IP address của bạn vào Network Access trong MongoDB Atlas
- **Error Handling**: Code đã có error handling đầy đủ
- **Validation**: Model có validation cho email và name

### 11. Cấu trúc files đã tạo/sửa:

- `backend/models/User.js` - User model với Mongoose
- `backend/server.js` - Kết nối MongoDB Atlas
- `backend/controllers/userController.js` - Controller với MongoDB operations
- `backend/.env.example` - Template cho environment variables

### 12. Troubleshooting

**Lỗi kết nối:**
- Kiểm tra connection string trong `.env`
- Kiểm tra Network Access trong MongoDB Atlas
- Kiểm tra username/password có đúng không

**Lỗi validation:**
- Email phải đúng định dạng
- Name không được để trống và tối đa 50 ký tự

### 13. Commit và Push

```bash
git add .
git commit -m "Tích hợp MongoDB Atlas cho user management"
git push origin database
```

Tạo Pull Request từ branch `database` vào branch chính.