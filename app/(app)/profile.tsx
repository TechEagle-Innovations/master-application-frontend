import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserCircleIcon } from 'react-native-heroicons/solid';
import { CalendarIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from 'react-native-heroicons/outline';
import Header from '@/components/Header';
import { authService } from '@/utils/api/services/AuthService';
import { useAuth } from '@/utils/auth/AuthContext';
import { locationIdToNameMap } from '@/utils/api/config';

const userProfile = {
  userName: 'John Anderson',
  date_birth: 'March 15, 1990',
  useremail: 'john.anderson@email.com',
  phone_no: '+1 (555) 123-4567',
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
  const [profile, setProfile] = useState<any>({});
  const { user } = useAuth();

  useEffect(() => {
    const getProfile = async () => {
      try {
        if (!user?.email) {
          return;
        }
        const userProfile = await authService.getProfile(user.email);
        console.log("PROFILE DATA", userProfile);
        setProfile(userProfile);
      } catch (error) {
        console.log(error);
      }
    }
    getProfile();
    return;
  }, [user]);
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}

      <Header insets={insets} text={"Profile"} />
      {/* Profile Image */}
      <View className="items-center mt-8 mb-6">
        {profile?.url ? <Image
          source={{ uri: profile.url }}
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: '#f3f4f6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            // elevation: 4,
          }}
          accessibilityLabel="Profile picture"
          onError={(e) => {
            // fallback: show icon if image fails
            // (could use state to swap to <UserCircleIcon />)
          }}
        /> : <UserCircleIcon size={120} color="gray" />
        }
      </View>
      {/* User Info */}
      <View className="bg-white rounded-3xl p-6 shadow-lg">
        <InfoRow icon={<UserCircleIcon size={24} color="#9ca3af" />} label="Username" value={profile.userName} />
        <InfoRow icon={<CalendarIcon size={22} color="#9ca3af" />} label="Date of Birth" value={new Date(profile.date_birth).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} />
        <InfoRow icon={<EnvelopeIcon size={22} color="#9ca3af" />} label="Email Address" value={profile.useremail} />
        <InfoRow icon={<PhoneIcon size={22} color="#9ca3af" />} label="Phone Number" value={profile.phone_no} />
        <InfoRow icon={<MapPinIcon size={22} color="#9ca3af" />} label="Location" value={locationIdToNameMap[profile.location as keyof typeof locationIdToNameMap]} />
      </View>
    </View>
  );
} 