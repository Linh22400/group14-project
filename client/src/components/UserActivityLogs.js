import React, { useState, useEffect, useCallback } from 'react';
import { getMyActivityLogs, formatActivityLog, getActionColor } from '../services/activityLogService';
import './UserActivityLogs.css';

const UserActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const logsPerPage = 15;

  useEffect(() => {
    fetchActivityLogs();
  }, [currentPage, filters, fetchActivityLogs]);

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: logsPerPage,
        ...filters
      };

      const response = await getMyActivityLogs(params);
      
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
      let errorMessage = 'Không thể tải nhật ký hoạt động của bạn';
      
      if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xem nhật ký hoạt động.';
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
  }, [currentPage, filters, logsPerPage]);

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
  }, [error, loading, fetchActivityLogs]);

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
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
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

  const renderLogCard = (log) => (
    <div key={log._id} className="log-card">
      <div className="log-header">
        <div className="log-timestamp">{log.formattedTimestamp}</div>
        <span className={`badge badge-${getActionColor(log.action)}`}>
          {log.actionLabel}
        </span>
      </div>
      <div className="log-content">
        <div className="log-status">
          {log.success ? (
            <span className="status-success">✓ Thành công</span>
          ) : (
            <span className="status-failed">✗ Thất bại</span>
          )}
        </div>
        {log.details && (
          <div className="log-details">
            <div className="details-title">Chi tiết:</div>
            <div className="details-content">
              {typeof log.details === 'object' ? (
                <pre>{JSON.stringify(log.details, null, 2)}</pre>
              ) : (
                log.details
              )}
            </div>
          </div>
        )}
        <div className="log-ip">
          <strong>IP:</strong> {log.ipAddress || 'Không xác định'}
        </div>
      </div>
    </div>
  );

  if (loading && logs.length === 0) {
    return (
      <div className="user-activity-logs">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải nhật ký hoạt động của bạn...</p>
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
      <div className="user-activity-logs">
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
    <div className="user-activity-logs">
      <div className="header-section">
        <h2>Nhật ký hoạt động của tôi</h2>
        <p className="subtitle">Theo dõi các hoạt động gần đây của bạn</p>
      </div>

      <div className="controls-section">
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="btn btn-secondary"
        >
          {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </button>
        <button 
          onClick={fetchActivityLogs} 
          className="btn btn-primary"
          disabled={loading}
        >
          Làm mới
        </button>
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
                <option value="PASSWORD_RESET_REQUEST">Yêu cầu đặt lại mật khẩu</option>
                <option value="PASSWORD_RESET_SUCCESS">Đặt lại mật khẩu thành công</option>
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
            <button onClick={clearFilters} className="btn btn-outline-secondary">
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalLogs}</div>
            <div className="stat-label">Tổng hoạt động</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {logs.filter(log => log.action === 'LOGIN_FAILED').length}
            </div>
            <div className="stat-label">Đăng nhập thất bại</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {logs.filter(log => log.action === 'LOGIN' && log.success).length}
            </div>
            <div className="stat-label">Đăng nhập thành công</div>
          </div>
        </div>
      </div>

      <div className="logs-section">
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}

        {!loading && logs.length === 0 && (
          <div className="no-logs">
            <div className="no-logs-icon">📋</div>
            <h3>Chưa có hoạt động nào</h3>
            <p>Các hoạt động của bạn sẽ được hiển thị ở đây</p>
          </div>
        )}

        {!loading && logs.length > 0 && (
          <>
            <div className="logs-grid">
              {logs.map(renderLogCard)}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {renderPagination()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserActivityLogs;