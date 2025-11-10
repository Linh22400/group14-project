# Hướng dẫn test chức năng Moderator

## Tổng quan
Đã hoàn thành việc mở rộng quyền cho moderator để quản lý user với các giới hạn sau:

### Quyền hạn của Moderator:
✅ **Được phép:**
- Truy cập dashboard quản trị (Admin/Moderator Dashboard)
- Xem danh sách user (trừ admin)
- Tạo user mới (chỉ được tạo user/moderator)
- Sửa role user thành user hoặc moderator
- Xóa user (không được xóa admin)

❌ **Không được phép:**
- Xem tab thống kê (chỉ admin mới thấy)
- Tạo hoặc sửa role thành admin
- Xóa admin
- Thay đổi role của admin

### Cách test:

#### 1. Login với moderator
- Email: `moderator@example.com`
- Password: [liên hệ admin để lấy password]

#### 2. Kiểm tra giao diện
- **Dashboard**: Hiển thị "Bảng điều khiển Moderator" thay vì "Admin"
- **Tabs**: Chỉ thấy 2 tabs: "Quản lý vai trò" và "Quản lý người dùng"
- **Thông báo**: Có cảnh báo "Với tư cách Moderator, bạn chỉ có thể quản lý vai trò User và Moderator"

#### 3. Test chức năng

**Test tạo user mới:**
1. Vào tab "Quản lý người dùng"
2. Thử tạo user mới
3. Kiểm tra user được tạo với role mặc định là "user"

**Test sửa role:**
1. Vào tab "Quản lý vai trò"
2. Thử sửa role của user thành "moderator"
3. Không được thấy option "admin" trong dropdown
4. Không được phép sửa role của admin (admin không hiện trong danh sách)

**Test xóa user:**
1. Thử xóa user có role "user" hoặc "moderator"
2. Không được phép xóa user có role "admin"

#### 4. Test các hành vi bị cấm

**Thử tạo admin (qua API):**
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer [moderator-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "testadmin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```
**Expected**: Nhận lỗi 403 Forbidden

**Thử sửa role thành admin:**
```bash
curl -X PUT http://localhost:3000/api/admin/users/[user-id]/role \
  -H "Authorization: Bearer [moderator-token]" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```
**Expected**: Nhận lỗi 403 Forbidden

**Thử xóa admin:**
```bash
curl -X DELETE http://localhost:3000/api/users/[admin-id] \
  -H "Authorization: Bearer [moderator-token]"
```
**Expected**: Nhận lỗi 403 Forbidden

### URL Test
- **Client**: http://localhost:3001
- **Server**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Lưu ý quan trọng:
1. Moderator chỉ thấy user có role "user" và "moderator" trong danh sách
2. User có role "admin" được ẩn khỏi danh sách đối với moderator
3. Mọi thay đổi role đều được log và kiểm tra quyền trên server
4. Frontend chỉ hiển thị các option phù hợp với quyền của moderator

### Troubleshooting:
- Nếu không login được: Kiểm tra token và password
- Nếu không thấy dashboard: Kiểm tra role trong localStorage
- Nếu bị lỗi 403: Đó là hành vi mong đợi, moderator không có quyền đó