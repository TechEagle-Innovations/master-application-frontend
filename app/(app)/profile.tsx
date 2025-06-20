import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { UserCircleIcon } from 'react-native-heroicons/solid';
import { CalendarIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from 'react-native-heroicons/outline';
import Header from '@/components/Header';

const user = {
  name: 'John Anderson',
  dob: 'March 15, 1990',
  email: 'john.anderson@email.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, United States',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="mb-6">
     
      
        <Text className="mb-1 text-base text-gray-500">{label}</Text>
      
       <View className="flex-row items-center mb-1">
       {icon}
      <Text className="ml-3 text-lg text-gray-800">{value || 'N/A'}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}

      <Header insets={insets} text={"Profile"} />
      {/* Profile Image */}
      <View className="items-center mt-8 mb-6">
        <Image
          source={{ uri: user.avatar }}
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: '#f3f4f6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
          accessibilityLabel="Profile picture"
          onError={(e) => {
            // fallback: show icon if image fails
            // (could use state to swap to <UserCircleIcon />)
          }}
        />
      </View>
      {/* User Info */}
      <View className="bg-white rounded-3xl p-6 shadow-lg">
        <InfoRow icon={<UserCircleIcon size={24} color="#9ca3af" />} label="Full Name" value={user.name} />
        <InfoRow icon={<CalendarIcon size={22} color="#9ca3af" />} label="Date of Birth" value={user.dob} />
        <InfoRow icon={<EnvelopeIcon size={22} color="#9ca3af" />} label="Email Address" value={user.email} />
        <InfoRow icon={<PhoneIcon size={22} color="#9ca3af" />} label="Phone Number" value={user.phone} />
        <InfoRow icon={<MapPinIcon size={22} color="#9ca3af" />} label="Location" value={user.location} />
      </View>
    </View>
  );
} 