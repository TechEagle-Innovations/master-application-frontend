import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShipment } from '@/utils/ShipmentContext';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';

interface Flight {
  flightId: string;
  droneId: string;
  installed_by: string;
  all_Battery: string[];
}

export default function FlightHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { selectedBattery } = useShipment();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const history = selectedBattery?.flight_history || [];

  // Render List Item
  const renderItem = ({ item, index }: { item: Flight; index: number }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 flex-row justify-between items-center shadow"
      onPress={() => setSelectedIndex(index)}
    >
      <Text className="text-lg font-medium">{item.flightId}</Text>
      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // If an item is selected, show details view
  if (selectedIndex !== null) {
    const flight: Flight = history[selectedIndex];
    return (
      <View className="flex-1 bg-white" >
        {/* Header */}
     <Header insets={insets} text="Flight History" />

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Flight Information */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-lg font-semibold mb-2">Flight Information</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Flight ID</Text>
              <Text className="text-base">{flight.flightId}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-500">Drone ID</Text>
              <Text className="text-base">{flight.droneId}</Text>
            </View>
          </View>

          {/* Battery Information */}
          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-lg font-semibold mb-2">Battery Information</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Installed By</Text>
              <Text className="text-base">{flight.installed_by}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-500">Companion Batteries</Text>
              <View className="flex-1 ml-2">
                {flight.all_Battery.map((bat, i) => (
                  <Text key={i} className="text-base">{bat}</Text>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Default: show history list
  return (
    <View className="flex-1 bg-gray-50" >
     <Header insets={insets} text="Flight History" />
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={history}
        keyExtractor={(item) => item.flightId}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No flight history available.
          </Text>
        }
      />
    </View>
  );
}
