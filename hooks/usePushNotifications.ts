import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { notificationService } from '@/utils/api/services/notificationservice';
import { useNotificationContext } from '@/utils/NotificationProvider';
import { Alert } from 'react-native';

export function usePushNotifications(jwt: string | null) {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const { setLastNotification } = useNotificationContext();

  useEffect(() => {
    let pushToken: string | null = null;
    console.log("jwt", jwt);
    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) {
        Alert.alert('Push notifications are only supported on physical devices.');
        return;
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission required', 'Push notification permissions were not granted.');
        return;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      pushToken = tokenData.data;
      console.log('PUSH TOKEN', pushToken);
      await notificationService.registerToken(pushToken);
    }

    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Update context with the latest notification
      setLastNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Update context with the notification response
      setLastNotification(response);
    });

    return () => {
      if (pushToken) {
        notificationService.removeToken(pushToken).catch(() => {});
      }
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [jwt, setLastNotification]);
} 