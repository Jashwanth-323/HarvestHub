import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const Notification: React.FC = () => {
  const { notification } = useAppContext();

  if (!notification) {
    return null;
  }

  const baseClasses = 'fixed top-5 right-5 z-[100] px-6 py-3 rounded-lg shadow-lg text-white text-sm font-semibold transition-opacity duration-300';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]}`}>
      {notification.message}
    </div>
  );
};

export default Notification;