import React from 'react';
import Notification from './Notification';
import { useNotification } from '../contexts/NotificationContext';

const NotificationContainer = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification) return null;

  return (
    <Notification 
      key={notification.id}
      message={notification.message} 
      type={notification.type}
      onClose={hideNotification}
    />
  );
};

export default NotificationContainer;