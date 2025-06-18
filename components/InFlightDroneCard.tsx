import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BatteryIcon from '@/assets/images/battery.svg';
import DroneIcon from '@/assets/images/droneIcon.svg';

interface InFlightDroneCardProps {
  id: string;
  from: string;
  to: string;
  eta: string;
  battery: number;
  arrived?: boolean;
  onPress?: () => void;
}

const InFlightDroneCard: React.FC<InFlightDroneCardProps> = ({ id, from, to, eta, battery, arrived, onPress }) => {
  return (
    <TouchableOpacity
      className={`rounded-2xl p-4 mb-4 shadow-md ${arrived ? 'bg-orange-500' : 'bg-white'}`}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Drone ${id}`}
      accessibilityHint="View drone details"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`text-xl font-semibold ${arrived ? 'text-white' : 'text-gray-800'}`}>{id}</Text>
        <View className="flex-row items-center">
          <BatteryIcon width={22} height={22} />
          <Text className={`ml-1 font-semibold ${arrived ? 'text-white' : 'text-green-600'}`}>{battery}%</Text>
        </View>
      </View>
      <View className="flex-row items-center w-full mb-2">
        <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
        <View className="flex-1 h-0.5 bg-white/60 dark:bg-gray-300" style={{ backgroundColor: arrived ? '#fff' : '#e5e7eb' }} />
        <DroneIcon size={24} style={{ marginHorizontal: -14 }} className={'z-60'} />
        <View className="flex-1 h-0.5 bg-white/60 dark:bg-gray-300" style={{ backgroundColor: arrived ? '#fff' : '#e5e7eb' }} />
        <View className={`w-2 h-2 rounded-full ${arrived ? 'bg-green-300' : 'bg-green-500'} ml-2`} />
      </View>
      <View className="flex-row justify-between items-center mt-1">
        <Text className={`text-base ${arrived ? 'text-white' : 'text-gray-700'}`}>{from}</Text>
        <Text className={`font-bold ${arrived ? 'text-white' : 'text-gray-800'}`}>ETA: {arrived ? 'Arrived' : eta}</Text>
        <Text className={`text-base ${arrived ? 'text-white' : 'text-gray-700'}`}>{to}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default InFlightDroneCard; 