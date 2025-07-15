import React, { createContext, ReactNode, useContext, useState } from "react";

interface NotificationContextProps {
  lastNotification: any;
  setLastNotification: (notification: any) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [lastNotification, setLastNotification] = useState<any>(null);

  return (
    <NotificationContext.Provider value={{ lastNotification, setLastNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
} 