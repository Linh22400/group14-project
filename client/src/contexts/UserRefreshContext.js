import React, { createContext, useContext, useState, useCallback } from 'react';

const UserRefreshContext = createContext();

export const useUserRefresh = () => {
  const context = useContext(UserRefreshContext);
  if (!context) {
    throw new Error('useUserRefresh must be used within a UserRefreshProvider');
  }
  return context;
};

export const UserRefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshUsers = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const value = {
    refreshKey,
    refreshUsers
  };

  return (
    <UserRefreshContext.Provider value={value}>
      {children}
    </UserRefreshContext.Provider>
  );
};