import { useUserRefresh } from '../contexts/UserRefreshContext';

export const useAvatarRefresh = () => {
  const { refreshUsers } = useUserRefresh();

  // Hàm để gọi khi avatar được cập nhật
  const refreshOnAvatarUpdate = () => {
    // Delay nhẹ để đảm bảo server đã xử lý xong
    setTimeout(() => {
      refreshUsers();
    }, 500);
  };

  return {
    refreshOnAvatarUpdate
  };
};