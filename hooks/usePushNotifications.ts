import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { NotificationService } from '@/utils/api/services/notificationservice';

export function usePushNotifications(jwt: string | null) {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    let pushToken: string | null = null;

    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      pushToken = tokenData.data;
      await NotificationService.registerToken(pushToken, jwt);
    }

    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle notification received in foreground
      // You can update state/context here
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification response (user taps notification)
      // You can navigate or update state/context here
    });

    return () => {
      if (pushToken) {
        NotificationService.removeToken(pushToken, jwt).catch(() => {});
      }
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [jwt]);
} 