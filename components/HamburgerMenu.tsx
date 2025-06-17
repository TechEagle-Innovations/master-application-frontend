import { useAuth } from '@/utils/auth/AuthContext';
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TouchableWithoutFeedback, StatusBar, Platform } from 'react-native';
import { UserCircleIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logout from "@/assets/images/logout.svg";
import Battery from "@/assets/images/battery.svg";
import Location from "@/assets/images/location.svg";
import Help from "@/assets/images/help.svg";

interface HamburgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isVisible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View 
      className="absolute inset-0 z-40"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <TouchableOpacity 
        className="absolute inset-0"
        activeOpacity={1}
        onPress={onClose}
      />
      <SafeAreaView 
        className="absolute top-0 right-0 bottom-0 w-3/4 bg-white shadow-lg z-50"
        style={{
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        }}
      >
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View className="flex-1">
            {/* User Profile Section */}
            <View className="flex items-center p-4 border-b border-gray-200">
              <UserCircleIcon size={80} color="gray" /> 
              <View className="ml-3">
                <Text className="text-xl text-center ">John Doe</Text>
                
              </View>
            </View>

            {/* Menu Items */}
            <View className="flex-1 mt-4">
              <TouchableOpacity 
                className="flex-row items-center p-6 active:bg-gray-100"
                accessibilityRole="button"
                accessibilityLabel="Batteries"
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
    </View>
  );
};

export default HamburgerMenu; 