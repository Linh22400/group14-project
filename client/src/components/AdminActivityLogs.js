import React, { useState, useEffect } from 'react';
import { 
  getAllActivityLogs, 
  getActivityStats, 
  getFailedLoginAttempts, 
  exportActivityLogs, 
  cleanupOldLogs,
  formatActivityLog,
  getActionColor
} from '../services/activityLogService';
import './AdminActivityLogs.css';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [failedLogins, setFailedLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
    success: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [exportFormat, setExportFormat] = useState('csv');
  const [cleanupDays, setCleanupDays] = useState(30); // Đổi từ 90 sang 30 ngày
  const [deleteAllMode, setDeleteAllMode] = useState(false); // Thêm mode xóa hết
  const [autoReload, setAutoReload] = useState(true); // Tự động reload sau khi xóa

  const logsPerPage = 20;

  useEffect(() => {
    fetchActivityLogs();
    fetchActivityStats();
    fetchFailedLoginAttempts();
  }, [currentPage, filters]);

  // Thêm useEffect để fetch lại khi component được mount lại sau khi đăng nhập
  useEffect(() => {
    const handleFocus = () => {
      // Khi tab/window được focus lại, thử fetch lại nếu có lỗi
      if (error && !loading) {
        fetchActivityLogs();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [error, loading]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: logsPerPage,
        ...filters
      };

      const response = await getAllActivityLogs(params);
      console.log('Activity logs response:', response);
      
      if (response.success) {
        const formattedLogs = response.data.logs.map(formatActivityLog);
        setLogs(formattedLogs);
        setTotalPages(response.data.pagination.pages);
        setTotalLogs(response.data.pagination.total);
      } else {
        throw new Error(response.message || 'Failed to fetch logs');
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      
      // Kiểm tra lỗi cụ thể
      let errorMessage = 'Không thể tải nhật ký hoạt động';
      
      if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập trang quản trị.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Không tìm thấy dữ liệu nhật ký.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await getActivityStats();
      console.log('Activity stats response:', response);
      if (response.success) {
        console.log('Stats data structure:', response.data);
        
        // Tính toán các thống kê từ dữ liệu backend
        const actionStats = response.data.actionStats || [];
        const topUsers = response.data.topUsers || [];
        
        console.log('Action stats:', actionStats);
        console.log('Top users:', topUsers);
        
        // Tính tổng số hoạt động
        const totalLogs = actionStats.reduce((sum, stat) => sum + (stat.count || 0), 0);
        
        // Tính số người dùng hoạt động (từ topUsers)
        const totalUsers = topUsers.length;
        
        // Tìm số đăng nhập thất bại từ actionStats
        const failedLoginStat = actionStats.find(stat => stat._id === 'LOGIN_FAILED');
        const failedLogins = failedLoginStat ? (failedLoginStat.count || 0) : 0;
        
        // Ước tính số IP unique (có thể cần API riêng cho chính xác)
        const uniqueIPs = 'N/A'; // Cần API riêng để đếm IP
        
        console.log('Calculated stats:', { totalLogs, totalUsers, failedLogins });
        
        setStats({
          totalLogs,
          totalUsers,
          failedLogins,
          uniqueIPs,
          actionStats,
          topUsers,
          hourlyDistribution: response.data.hourlyDistribution || []
        });
      }
    } catch (err) {
      console.error('Error fetching activity stats:', err);
    }
  };

  const fetchFailedLoginAttempts = async () => {
    try {
      const response = await getFailedLoginAttempts({ limit: 50 });
      console.log('Failed login attempts response:', response);
      if (response.success && response.data) {
        // Format logs để hiển thị đúng
        const formattedLogs = response.data.logs.map(log => formatActivityLog(log));
        setFailedLogins(formattedLogs);
      }
    } catch (err) {
      console.error('Error fetching failed login attempts:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      userId: '',
      startDate: '',
      endDate: '',
      success: ''
    });
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await exportActivityLogs({ ...filters }, exportFormat);
    } catch (err) {
      console.error('Error exporting logs:', err);
      setError('Không thể xuất nhật ký');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    let daysToDelete = deleteAllMode ? 0 : cleanupDays;
    
    // Kiểm tra giá trị hợp lệ
    if (!deleteAllMode && (!cleanupDays || cleanupDays < 1 || cleanupDays > 365)) {
      alert('Vui lòng nhập số ngày hợp lệ (1-365 ngày)');
      return;
    }

    let confirmMessage = '';
    if (deleteAllMode) {
      confirmMessage = 'Bạn có chắc chắn muốn XÓA HẾT TẤT CẢ nhật ký hoạt động? Hành động này không thể hoàn tác!';
    } else {
      confirmMessage = `Bạn có chắc chắn muốn xóa nhật ký cũ hơn ${cleanupDays} ngày?`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      console.log('Calling cleanup with days:', daysToDelete);
      const response = await cleanupOldLogs(daysToDelete);
      console.log('Cleanup response:', response);
      if (response.success) {
          const message = deleteAllMode 
            ? `Đã xóa tất cả ${response.data.deletedCount} nhật ký`
            : `Đã xóa ${response.data.deletedCount} nhật ký cũ`;
          alert(message);
          
          if (autoReload) {
            // Tự động reload lại trang sau khi xóa thành công
            setTimeout(() => {
              window.location.reload();
            }, 1000); // Đợi 1 giây để user đọc thông báo
          } else {
            // Nếu không reload, fetch lại dữ liệu mới
            fetchActivityLogs();
            fetchActivityStats();
          }
        }
    } catch (err) {
      console.error('Error cleaning up logs:', err);
      setError('Không thể xóa nhật ký cũ');
    } finally {
      setLoading(false);
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key="first" onClick={() => paginate(1)} className="pagination-btn">
          «
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <button key="last" onClick={() => paginate(totalPages)} className="pagination-btn">
          »
        </button>
      );
    }

    return pages;
  };

  const renderLogRow = (log) => (
    <tr key={log._id} className="log-row">
      <td className="log-timestamp">{log.formattedTimestamp}</td>
      <td className="log-user">
        <div className="user-info">
          <div className="user-name">{log.userDisplay}</div>
          <div className="user-email">{log.userEmail}</div>
        </div>
      </td>
      <td className="log-action">
        <span className={`badge badge-${getActionColor(log.action)}`}>
          {log.actionLabel}
        </span>
      </td>
      <td className="log-details">
        <div className="details-content">
          {log.details && typeof log.details === 'object' ? (
            <pre>{JSON.stringify(log.details, null, 2)}</pre>
          ) : (
            log.details || '-'
          )}
        </div>
      </td>
      <td className="log-status">
        {log.success ? (
          <span className="badge badge-success">✓</span>
        ) : (
          <span className="badge badge-danger">✗</span>
        )}
      </td>
      <td className="log-ip">{log.ipAddress || '-'}</td>
    </tr>
  );

  if (loading && logs.length === 0) {
    return (
      <div className="admin-activity-logs">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải nhật ký hoạt động...</p>
        </div>
      </div>
    );
  }

  if (error && logs.length === 0) {
    const handleAuthError = () => {
      if (error.includes('Phiên đăng nhập') || error.includes('quyền')) {
        // Clear error và cho phép user tự đăng nhập lại
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setError(null);
        // Hiển thị thông báo để user biết cần đăng nhập lại
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại và quay lại trang này.');
      } else {
        fetchActivityLogs();
      }
    };

    return (
      <div className="admin-activity-logs">
        <div className="error-container">
          <div className="error-message">
            <h3>Lỗi</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleAuthError} className="btn btn-primary">
                {error.includes('Phiên đăng nhập') || error.includes('quyền') ? 'Đã đăng nhập lại? Click để thử' : 'Thử lại'}
              </button>
              <button onClick={() => window.location.href = '/'} className="btn btn-secondary">
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-activity-logs">
      <div className="header-section">
        <h2>Quản lý nhật ký hoạt động</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="btn btn-secondary"
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>
          <button 
            onClick={handleExport} 
            className="btn btn-success"
            disabled={loading}
          >
            Xuất dữ liệu ({exportFormat})
          </button>
          <button 
            onClick={handleCleanup} 
            className="btn btn-warning"
            disabled={loading}
          >
            {deleteAllMode ? 'Xóa hết tất cả' : `Dọn dẹp cũ (${cleanupDays} ngày)`}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>Hành động:</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="form-control"
              >
                <option value="">Tất cả</option>
                <option value="LOGIN">Đăng nhập</option>
                <option value="LOGOUT">Đăng xuất</option>
                <option value="LOGIN_FAILED">Đăng nhập thất bại</option>
                <option value="REGISTER">Đăng ký</option>
                <option value="PROFILE_UPDATE">Cập nhật hồ sơ</option>
                <option value="PASSWORD_CHANGE">Thay đổi mật khẩu</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Trạng thái:</label>
              <select
                value={filters.success}
                onChange={(e) => handleFilterChange('success', e.target.value)}
                className="form-control"
              >
                <option value="">Tất cả</option>
                <option value="true">Thành công</option>
                <option value="false">Thất bại</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Từ ngày:</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="filter-group">
              <label>Đến ngày:</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
          <div className="filter-actions">
            <div className="filter-group">
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  id="deleteAllMode"
                  className="form-check-input"
                  checked={deleteAllMode}
                  onChange={(e) => setDeleteAllMode(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="deleteAllMode">
                  Xóa hết tất cả logs
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  id="autoReload"
                  className="form-check-input"
                  checked={autoReload}
                  onChange={(e) => setAutoReload(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="autoReload">
                  Tự động reload sau khi xóa
                </label>
              </div>
              {!deleteAllMode && (
                <div>
                  <label>Số ngày giữ lại khi dọn dẹp:</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={cleanupDays}
                    onChange={(e) => setCleanupDays(parseInt(e.target.value) || 30)}
                    className="form-control"
                    style={{ width: '100px' }}
                  />
                  <small className="form-text text-muted">Ngày</small>
                </div>
              )}
            </div>
            <button onClick={clearFilters} className="btn btn-outline-secondary">
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {stats && (
        <div className="stats-section">
          <h3>Thống kê hoạt động</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalLogs || 0}</div>
              <div className="stat-label">Tổng số hoạt động</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalUsers || 0}</div>
              <div className="stat-label">Người dùng hoạt động</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.failedLogins || 0}</div>
              <div className="stat-label">Đăng nhập thất bại</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.uniqueIPs || 'N/A'}</div>
              <div className="stat-label">Địa chỉ IP</div>
            </div>
          </div>
        </div>
      )}

      <div className="tabs-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả hoạt động
          </button>
          <button
            className={`tab ${activeTab === 'failed' ? 'active' : ''}`}
            onClick={() => setActiveTab('failed')}
          >
            Đăng nhập thất bại ({failedLogins.length})
          </button>
        </div>
      </div>

      <div className="logs-section">
        <div className="logs-header">
          <h3>
            {activeTab === 'all' 
              ? `Tất cả hoạt động (${totalLogs})` 
              : `Đăng nhập thất bại (${failedLogins.length})`
            }
          </h3>
        </div>

        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người dùng</th>
                <th>Hành động</th>
                <th>Chi tiết</th>
                <th>Trạng thái</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'all' ? (
                logs.map(renderLogRow)
              ) : (
                (failedLogins || []).map(renderLogRow)
              )}
            </tbody>
          </table>

          {loading && (
            <div className="table-loading">
              <div className="spinner"></div>
            </div>
          )}

          {!loading && ((activeTab === 'all' && logs.length === 0) || (activeTab === 'failed' && failedLogins.length === 0)) && (
            <div className="no-data">
              <p>Không có dữ liệu</p>
            </div>
          )}
        </div>

        {activeTab === 'all' && totalPages > 1 && (
          <div className="pagination">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLogs;