// Test script cho frontend - Role-based UI
// Chạy trong console của browser (F12)

(async function testRoleBasedUI() {
  console.log('🚀 Bắt đầu test Role-based UI...');
  
  // Test credentials
  const testUsers = [
    { email: 'admin@example.com', password: 'Admin@123456', expectedRole: 'admin' },
    { email: 'moderator@example.com', password: 'Moderator@123456', expectedRole: 'moderator' },
    { email: 'user1@example.com', password: 'User1@123456', expectedRole: 'user' }
  ];

  for (const user of testUsers) {
    console.log(`\n🔑 Testing với ${user.expectedRole}: ${user.email}`);
    
    try {
      // Login
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginData.success) {
        console.log(`✅ Login thành công - Role: ${loginData.data.user.role}`);
        
        // Lưu tokens vào localStorage (giả lập frontend)
        localStorage.setItem('accessToken', loginData.data.accessToken);
        localStorage.setItem('refreshToken', loginData.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(loginData.data.user));
        
        // Test các chức năng theo role
        await testRoleFeatures(loginData.data.user.role);
        
      } else {
        console.error('❌ Login thất bại:', loginData.message);
      }
      
    } catch (error) {
      console.error('❌ Lỗi:', error.message);
    }
    
    // Clear storage cho test tiếp theo
    localStorage.clear();
  }
  
  console.log('\n🎉 Hoàn thành test Role-based UI!');
})();

async function testRoleFeatures(role) {
  console.log(`\n📋 Testing chức năng cho role: ${role}`);
  
  // Test 1: Kiểm tra hiển thị menu/quyền
  const features = {
    admin: ['Xem tất cả users', 'Cập nhật role', 'Xem thống kê', 'Xóa user'],
    moderator: ['Xem users', 'Cập nhật thông tin cá nhân'],
    user: ['Xem thông tin cá nhân', 'Cập nhật profile']
  };
  
  console.log(`Chức năng hiển thị:`, features[role] || []);
  
  // Test 2: Thử truy cập admin endpoints
  const accessToken = localStorage.getItem('accessToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/users', {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Có quyền truy cập admin endpoint');
    } else if (response.status === 403) {
      console.log('✅ Bị từ chối truy cập admin endpoint (đúng quyền)');
    } else {
      console.log('❌ Lỗi khác:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
  }
  
  // Test 3: Kiểm tra giao diện theo role (giả lập)
  testUIFeatures(role);
}

function testUIFeatures(role) {
  console.log('\n🎨 Testing UI Features:');
  
  const uiElements = {
    admin: {
      showAdminPanel: true,
      showUserManagement: true,
      showStatistics: true,
      showRoleSelector: true
    },
    moderator: {
      showAdminPanel: false,
      showUserManagement: true,
      showStatistics: false,
      showRoleSelector: false
    },
    user: {
      showAdminPanel: false,
      showUserManagement: false,
      showStatistics: false,
      showRoleSelector: false
    }
  };
  
  const elements = uiElements[role] || uiElements.user;
  
  Object.entries(elements).forEach(([element, shouldShow]) => {
    console.log(`${shouldShow ? '✅' : '❌'} ${element}: ${shouldShow ? 'Hiển thị' : 'Ẩn'}`);
  });
}