import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Accepts both legacy and new battery fields for compatibility
interface BatteryCardProps {
  battery: {
    battery_id?: string;
    charged_status?: string;
    last_used?: string;
    serialNumber?: string;
    chargingPercentage?: number;
  };
  onPress?: () => void;
}

function getStatusInfo(status?: string) {
  if (status === 'charged') return { text: 'Charged', color: '#22C55E' };
  if (status === 'discharged') return { text: 'Discharged', color: '#EF4444' };
  if (status === 'charging') return { text: 'Charging', color: '#F59E42' };
  return { text: '-', color: '#888' };
}

const BatteryCard: React.FC<BatteryCardProps> = ({ battery, onPress }) => {
  const statusInfo = getStatusInfo(battery.charged_status);
  return (
    <TouchableOpacity
      className="bg-white rounded-xl px-4 py-4 mb-3 b-none shadow-lg"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-lg font-semibold text-black">{battery.battery_id || battery.serialNumber || '-'}</Text>
        <Text className="text-base " style={{ color: statusInfo.color }}>{statusInfo.text}</Text>
      </View>
      <Text className="text-gray-500 text-base mt-1">
        Last Used: {battery.last_used ? battery.last_used : '-'}
      </Text>
    </TouchableOpacity>
  );
};

export default BatteryCard; 