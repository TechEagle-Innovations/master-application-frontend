import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../../utils/auth/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <View className="bg-gray-50 rounded-xl p-6 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Welcome, {user?.userName}!
          </Text>
          
          <View className="space-y-4">
            <InfoItem label="Email" value={user?.email} />
            <InfoItem label="Designation" value={user?.designation} />
            <InfoItem label="Location" value={user?.location} />
            <InfoItem label="Permission Status" value={user?.permission} />
          </View>
        </View>

        <View className="mt-8 bg-gray-50 rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </Text>
          
          <View className="space-y-4">
            {/* Add your quick action buttons or cards here */}
            <View className="bg-white p-4 rounded-lg border border-gray-200">
              <Text className="text-gray-600">
                Your dashboard content will appear here. Add components and features based on your application's requirements.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
      <Text className="text-gray-600 font-medium">{label}</Text>
      <Text className="text-gray-800">{value || 'N/A'}</Text>
    </View>
  );
} 