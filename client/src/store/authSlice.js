import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      // Trả về đúng user và token từ response.data
      return {
        user: response.data.user,
        token: response.data.accessToken
      };
    } catch (error) {
      // Xử lý các loại lỗi khác nhau
      let errorMessage = 'Không thể kết nối đến server. Vui lòng thử lại sau.';
      
      if (error.message) {
        // Kiểm tra status code trước tiên
        if (error.status === 429) {
          // Lấy thời gian chờ từ server response nếu có
          const retryAfter = error.serverData?.retryAfter || 30;
          if (retryAfter <= 60) {
            errorMessage = `Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ${retryAfter} giây.`;
          } else {
            const minutes = Math.ceil(retryAfter / 60);
            errorMessage = `Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ${minutes} phút.`;
          }
        } else if (error.status === 401) {
          errorMessage = 'Email hoặc mật khẩu không đúng.';
        } else if (error.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        } else if (error.status === 423) {
          // IP blocked
          const retryAfter = error.serverData?.retryAfter || 30;
          errorMessage = `IP của bạn đã bị chặn. Vui lòng thử lại sau ${retryAfter} giây.`;
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Yêu cầu bị timeout. Vui lòng thử lại.';
        } else {
          // Sử dụng message từ server nếu có
          errorMessage = error.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return {};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('No token found');
      }
      
      const user = authService.getUser();
      if (!user) {
        throw new Error('No user found');
      }
      
      return { user, token };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        // Không clear error ở đây để user có thể thấy lỗi cũ nếu có
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Không set error ở đây để không overwrite lỗi từ login
      });
  },
});

export const { clearError, setAuth, clearAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;