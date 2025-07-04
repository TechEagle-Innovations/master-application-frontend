import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, Info } from 'lucide-react-native';

export type NotificationType = 'success' | 'error' | 'info';
type NotificationPosition = 'top' | 'bottom';

interface NotificationProps {
    message?: string;
    type?: NotificationType;
    position?: NotificationPosition;
    duration?: number;
    onDismiss?: () => void;
    showIcon?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  position = 'top',
  duration = 3000,
  onDismiss,
  showIcon = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-dismiss
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onDismiss?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [message]); // Only re-run when message changes

  if (!message) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        top: position === 'top' ? 60 : undefined,
        bottom: position === 'bottom' ? 100 : undefined,
        opacity: fadeAnim,
        zIndex: 1000,
      }}
      className={`rounded-lg border p-4 flex-row items-center ${
        type === 'success' 
          ? 'bg-green-50 border-green-200' 
          : type === 'error' 
            ? 'bg-red-50 border-red-200' 
            : 'bg-blue-50 border-blue-200'
      }`}
    >
      {showIcon && (
        <View className="mr-3">
          {type === 'success' ? (
            <CheckCircle size={20} color="#166534" />
          ) : type === 'error' ? (
            <XCircle size={20} color="#991b1b" />
          ) : (
            <Info size={20} color="#1e40af" />
          )}
        </View>
      )}
      <Text className={`flex-1 text-sm ${
        type === 'success' 
          ? 'text-green-800' 
          : type === 'error' 
            ? 'text-red-800' 
            : 'text-blue-800'
      }`}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(onDismiss);
        }}
        className="ml-3"
      >
        <Text className={`text-sm font-medium ${
          type === 'success' 
            ? 'text-green-700' 
            : type === 'error' 
              ? 'text-red-700' 
              : 'text-blue-700'
        }`}>
          Dismiss
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
    container: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default Notification;