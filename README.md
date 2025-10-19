# 🚀 Quản Lý Người Dùng - Nhóm 14

## 📋 Giới Thiệu Dự Án

Dự án **Quản Lý Người Dùng** là một ứng dụng web full-stack giúp quản lý thông tin người dùng một cách hiệu quả. Ứng dụng được xây dựng với công nghệ hiện đại, giao diện thân thiện và tính năng hoàn chỉnh.

## 👥 Thành Viên Nhóm

- **Nguyễn Hồng Linh** - Backend Developer
- **Lê Vĩnh Phát** - Frontend Developer  
- **Nguyễn Thanh Dân** - Database Developer

## 🎯 Mục Tiêu Dự Án

- ✅ Thực hành làm việc nhóm với Git & GitHub
- ✅ Xây dựng ứng dụng CRUD hoàn chỉnh
- ✅ Áp dụng các công nghệ web hiện đại
- ✅ Học tập best practices trong phát triển web

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React.js** - UI library
- **CSS3** - Styling with inline styles
- **Axios** - HTTP client
- **React Hooks** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Database
- **MongoDB** - Database management
- **Mongoose Models** - Data modeling

## 📁 Cấu Trúc Dự Án

```
group14-project/
├── backend/                 # Backend server
│   ├── controllers/        # Business logic
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── .env               # Environment variables
│   ├── server.js          # Server entry point
│   └── package.json       # Backend dependencies
├── frontend/              # Frontend React app
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── App.js        # Main app component
│   │   └── index.js      # React entry point
│   └── package.json      # Frontend dependencies
├── database/             # Database models
│   ├── models/          # Shared data models
│   ├── index.js         # Database exports
│   └── README.md        # Database documentation
└── README.md            # Project documentation
```

## 🚀 Hướng Dẫn Chạy Dự Án

### Yêu Cầu Hệ Thống
- Node.js (v14 trở lên)
- MongoDB (v4 trở lên)
- npm hoặc yarn

### Cài Đặt Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env với các biến môi trường
echo "MONGODB_URI=mongodb://localhost:27017/user_management" > .env
echo "PORT=3000" >> .env

# Chạy server
npm start
```

### Cài Đặt Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

### Cài Đặt Database (Tùy chọn)

```bash
# Di chuyển vào thư mục database
cd database

# Cài đặt dependencies nếu cần
npm install
```

## 📋 Tính Năng Chính

### ✅ Đã Hoàn Thành
- [x] Thêm người dùng mới
- [x] Hiển thị danh sách người dùng
- [x] Chỉnh sửa thông tin người dùng
- [x] Xóa người dùng
- [x] Validation dữ liệu đầu vào
- [x] Thông báo lỗi/thành công
- [x] Responsive design
- [x] Loading states
- [x] Error handling

### 🔄 Đang Phát Triển
- [ ] Tìm kiếm người dùng
- [ ] Phân trang
- [ ] Sắp xếp và lọc
- [ ] Export dữ liệu
- [ ] Authentication

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Lấy tất cả users |
| POST | `/api/users` | Tạo user mới |
| PUT | `/api/users/:id` | Cập nhật user |
| DELETE | `/api/users/:id` | Xóa user |

## 🎯 Validation Features

### Frontend Validation
- ✅ Kiểm tra trường bắt buộc
- ✅ Định dạng email hợp lệ
- ✅ Độ dài tên (2-50 ký tự)
- ✅ Ký tự đặc biệt trong tên
- ✅ Giới hạn độ dài email (100 ký tự)
- ✅ Real-time validation
- ✅ Inline error messages

### Backend Validation
- ✅ Dữ liệu bắt buộc
- ✅ Định dạng email
- ✅ Xử lý lỗi server

## 🎨 Giao Diện Người Dùng

- Modern gradient design
- Responsive layout
- Loading animations
- Success/error notifications
- Intuitive form controls
- Hover effects and transitions

## 🛡️ Security Features

- Environment variables for sensitive data
- CORS configuration
- Input sanitization
- Error message handling

## 🚀 Deployment

### Development
```bash
# Backend
npm run dev

# Frontend
npm start
```

### Production
```bash
# Build frontend
npm run build

# Start production server
npm run start
```

## 📚 Tài Liệu Thêm

- [MongoDB Setup Guide](./MONGODB_SETUP_GUIDE.md)
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Database Documentation](./database/README.md)

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Tạo Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Liên Hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue hoặc liên hệ với các thành viên trong nhóm.

---

**⭐ Star repository nếu bạn thấy hữu ích!**
