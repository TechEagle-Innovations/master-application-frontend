import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BatteryIcon from '@/assets/images/battery.svg';
import DroneIcon from '@/assets/images/droneIcon.svg';
import { locationIdToNameMap } from '@/utils/api/config';

interface InFlightDroneCardProps {
  id: string;
  from: string;
  droneId: string;  // Add this line
  to: string;
  eta: string;
  battery: number;
  arrived?: boolean;
  onPress?: () => void;
}

const InFlightDroneCard: React.FC<InFlightDroneCardProps> = ({ id, droneId, from, to, eta, battery, arrived, onPress }) => {
  return (
    <TouchableOpacity
      className={`rounded-2xl p-4 mb-4 shadow-md ${arrived ? 'bg-orange-500' : 'bg-white'}`}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Drone ${id}`}
      accessibilityHint="View drone details"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center">
        <Text className={`text-lg font-semibold ${arrived ? 'text-white' : 'text-gray-800'}`}>{id}</Text>
        <View className="flex-row items-center">
          <BatteryIcon width={22} height={22} />
          <Text className={`ml-1 font-semibold ${arrived ? 'text-white' : 'text-green-600'}`}>{battery}%</Text>
        </View>
      </View>
      <View className="flex-row items-center w-full">
        <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
        <View className="flex-1 h-0.5 bg-white/60 dark:bg-gray-300" style={{ backgroundColor: arrived ? '#fff' : '#e5e7eb' }} />
        <DroneIcon width={50} height={50} style={{ marginHorizontal: -14 }} />
        <View className="flex-1 h-0.5 bg-white/60 dark:bg-gray-300" style={{ backgroundColor: arrived ? '#fff' : '#e5e7eb' }} />
        <View className={`w-2 h-2 rounded-full ${arrived ? 'bg-green-300' : 'bg-green-500'} ml-2`} />
      </View>
      <View className="flex flex-row justify-between items-center w-full space-x-2">
        {/* From location */}
        <Text
          className={`w-[45%] text-base truncate ${arrived ? 'text-white' : 'text-gray-700'}`}
          numberOfLines={1}
        >
          {locationIdToNameMap[from].split(' ').slice(0, 7).join(' ')}{locationIdToNameMap[from].split(' ').length > 7 ? '...' : ''}
        </Text>

        {/* ETA center text */}
        {/* <Text className={`flex-none px-2 font-bold ${arrived ? 'text-white' : 'text-gray-800'}`}>
          {arrived ? 'Arrived' : `ETA: ${eta}`}
        </Text> */}

        {/* To location */}
        <Text
          className={`w-[45%] text-base text-right truncate ${arrived ? 'text-white' : 'text-gray-700'}`}
          numberOfLines={1}
        >
          {locationIdToNameMap[to].split(' ').slice(0, 7).join(' ')}{locationIdToNameMap[to].split(' ').length > 7 ? '...' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default InFlightDroneCard; 