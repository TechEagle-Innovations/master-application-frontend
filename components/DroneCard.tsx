import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPinIcon } from 'react-native-heroicons/outline';

interface DroneCardProps {
  id: string;
  location: string;
  lastMaintainance: string;
  status: 'Assigned' | 'Stand-By';
  onPress?: () => void;
}

const DroneCard: React.FC<DroneCardProps> = ({ id, location, lastMaintainance, status, onPress }) => {
  const statusColorClass = status === 'Assigned' ? 'text-green-500' : 'text-orange-500';

  return (
    <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 shadow-md " onPress={onPress}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xl font-[500] text-gray-800">{id.slice(0, 6)}</Text>
        <Text className={`font-semibold ${statusColorClass}`}>{status}</Text>
      </View>
      <View className="flex-row items-center mb-1">
        <MapPinIcon size={16} color="gray" />
        <Text className="text-gray-600 ml-1">{location}</Text>
      </View>
      <Text className="text-gray-500 text-sm">Last Maintanance: {lastMaintainance}</Text>
    </TouchableOpacity>
  );
};

export default DroneCard; 