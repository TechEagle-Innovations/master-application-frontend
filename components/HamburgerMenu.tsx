import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, TouchableWithoutFeedback } from 'react-native';
import { Battery50Icon, MapPinIcon, QuestionMarkCircleIcon, ArrowLeftEndOnRectangleIcon } from 'react-native-heroicons/outline';
import { UserCircleIcon } from 'react-native-heroicons/solid';

interface HamburgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isVisible, onClose }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <TouchableOpacity 
      className="absolute inset-0 bg-gray-300 bg-opacity-10 z-40"
      activeOpacity={1}
      onPress={onClose}
    >
      <SafeAreaView 
        className="absolute top-0 right-0 bottom-0 w-3/4 bg-white shadow-lg z-50"
      >
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View className="flex-1">
            {/* User Profile Section */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
              {/* Placeholder for user image */}
              <UserCircleIcon size={50} color="gray" /> 
              <Text className="text-xl font-semibold ml-3">John Doe</Text>
            </View>

            {/* Menu Items */}
            <View className="mt-4">
              <TouchableOpacity className="flex-row items-center p-4 py-3">
                <Battery50Icon size={24} color="black" />
                <Text className="ml-3 text-lg">Batteries</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-4 py-3">
                <MapPinIcon size={24} color="black" />
                <Text className="ml-3 text-lg">Add a Location</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center p-4 py-3">
                <QuestionMarkCircleIcon size={24} color="black" />
                <Text className="ml-3 text-lg">Help and Support</Text>
              </TouchableOpacity>
            </View>

            {/* Log out */}
            <View className="absolute bottom-0 w-full p-4 border-t border-gray-200">
              <TouchableOpacity className="flex-row items-center justify-center bg-red-500 rounded-md py-3" onPress={onClose}>
                <ArrowLeftEndOnRectangleIcon size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </TouchableOpacity>
  );
};

export default HamburgerMenu; 