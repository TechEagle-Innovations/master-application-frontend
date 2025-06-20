import { useAuth } from '@/utils/auth/AuthContext';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TouchableWithoutFeedback, StatusBar, Platform, Animated, Easing } from 'react-native';
import { UserCircleIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logout from "@/assets/images/logout.svg";
import Battery from "@/assets/images/battery.svg";
import Location from "@/assets/images/location.svg";
import Help from "@/assets/images/help.svg";
import { useRouter } from 'expo-router';

interface HamburgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

// Custom hook for menu animation (SRP, OCP)
function useMenuAnimation(isVisible: boolean) {
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = offscreen, 0 = onscreen
  const fadeAnim = useRef(new Animated.Value(0)).current; // 0 = transparent, 1 = visible
  const [renderMenu, setRenderMenu] = useState(isVisible);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isVisible) {
      setRenderMenu(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
          speed: 5,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 0,
          speed: 5,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      timeout = setTimeout(() => setRenderMenu(false), 200);
    }
    return () => clearTimeout(timeout);
  }, [isVisible, slideAnim, fadeAnim]);
  return { slideAnim, fadeAnim, renderMenu };
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isVisible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const router = useRouter();
  const { slideAnim, fadeAnim, renderMenu } = useMenuAnimation(isVisible);

  const handleLogout = useCallback(async () => {
    await logout();
    onClose();
  }, [logout, onClose]);

  const handleNavigate = useCallback((path: string) => {
    router.push(path as any);
    onClose();
  }, [router, onClose]);

  if (!renderMenu) {
    return null;
  }

  return (
    <Animated.View
      className="absolute inset-0 z-40"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: fadeAnim,
      }}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <TouchableOpacity 
        className="absolute inset-0"
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '75%',
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 400],
              }),
            },
          ],
        }}
      >
        <SafeAreaView 
          className="flex-1 bg-white shadow-lg z-50"
          style={{
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
          }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="flex-1">
              {/* User Profile Section */}
              <TouchableOpacity className="flex items-center p-4 border-b border-gray-200" onPress={() => handleNavigate('/(app)/profile')}>
                <UserCircleIcon size={80} color="gray" /> 
                <View className="ml-3">
                  <Text className="text-xl text-center ">John Doe</Text>
                </View>
              </TouchableOpacity>

              {/* Menu Items */}
              <View className="flex-1 mt-4">
                <TouchableOpacity 
                  className="flex-row items-center p-6 active:bg-gray-100"
                  accessibilityRole="button"
                  accessibilityLabel="Batteries"
                  onPress={() => handleNavigate('/(app)/battery')}
                >
                  <Battery size={24} color="black" />
                  <Text className="ml-3 text-lg">Batteries</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-row items-center p-6 active:bg-gray-100"
                  accessibilityRole="button"
                  accessibilityLabel="Add a Location"
                >
                  <Location size={24} color="black" />
                  <Text className="ml-3 text-lg">Add a Location</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-row items-center p-6 active:bg-gray-100"
                  accessibilityRole="button"
                  accessibilityLabel="Help and Support"
                >
                  <Help size={24} color="black" />
                  <Text className="ml-3 text-lg">Help and Support</Text>
                </TouchableOpacity>
              </View>

              {/* Log out */}
              <View 
                className="w-full p-4 border-t border-gray-200"
                style={{
                  paddingBottom: insets.bottom + 16,
                }}
              >
                <TouchableOpacity 
                  className="flex-row items-center justify-center bg-white border border-gray-300 rounded-md py-3"
                  onPress={handleLogout}
                  accessibilityRole="button"
                  accessibilityLabel="Log out"
                >
                  <Logout size={20} color="white" />
                  <Text className="text-[#FF3B30] font-semibold ml-2">Log out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </Animated.View>
    </Animated.View>
  );
};

export default HamburgerMenu; 