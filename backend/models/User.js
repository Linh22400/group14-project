// Mock User model - không cần kết nối database
let users = [
  { _id: '1', name: 'Nguyễn Hồng Linh', email: 'linh@example.com' },
  { _id: '2', name: 'Lê Vĩnh Phát', email: 'phat@example.com' },
  { _id: '3', name: 'Nguyễn Thanh Dân', email: 'dan@example.com' }
];

// Tạo ID tự động
const generateId = () => {
  const maxId = users.reduce((max, user) => {
    const userId = parseInt(user._id);
    return userId > max ? userId : max;
  }, 0);
  return String(maxId + 1);
};

const User = {
  // Tìm tất cả users
  find: () => {
    return Promise.resolve(users);
  },

  // Tìm user theo ID
  findById: (id) => {
    const user = users.find(u => u._id === id);
    return Promise.resolve(user);
  },

  // Tạo user mới
  create: (userData) => {
    const newUser = {
      _id: generateId(),
      name: userData.name,
      email: userData.email
    };
    users.push(newUser);
    return Promise.resolve(newUser);
  },

  // Cập nhật user
  findByIdAndUpdate: (id, updateData, options = {}) => {
    const userIndex = users.findIndex(u => u._id === id);
    if (userIndex === -1) return Promise.resolve(null);
    
    const updatedUser = { ...users[userIndex] };
    
    // Áp dụng update data
    if (updateData.$set) {
      if (updateData.$set.name) updatedUser.name = updateData.$set.name;
      if (updateData.$set.email) updatedUser.email = updateData.$set.email;
    }
    
    users[userIndex] = updatedUser;
    return Promise.resolve(updatedUser);
  },

  // Xóa user
  findByIdAndDelete: (id) => {
    const userIndex = users.findIndex(u => u._id === id);
    if (userIndex === -1) return Promise.resolve(null);
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    return Promise.resolve(deletedUser);
  }
};

module.exports = User;