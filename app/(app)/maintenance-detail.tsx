import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useShipment } from '../../utils/ShipmentContext';
import SuccessIcon from "@/assets/images/successIcon.svg"
import Header from '@/components/Header';
export default function MaintenanceDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { maintenance } = useShipment();

  if (!maintenance) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-500">No maintenance record selected.</Text>
      </View>
    );
  }

  const isCompleted = maintenance.completed;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
     
      <Header insets={insets} text={"Maintenance Details"} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl ">Drone #{maintenance.droneId}</Text>
            {isCompleted ? (
              <View className="w-3 h-3 rounded-full bg-green-500" />
            ) : (
              <View className="w-3 h-3 rounded-full bg-orange-500" />
            )}
          </View>
          {/* Scheduled Details */}
          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
            <Text className="text-lg mb-3">Scheduled Details</Text>
            <Text className="text-gray-500 mb-1">Scheduled for:</Text>
            <Text className="text-base mb-3">{new Date(maintenance.scheduledDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</Text>
            <Text className="text-gray-500 mb-1">Reason:</Text>
            <Text className="text-base mb-3">{maintenance.reason}</Text>
            <Text className="text-gray-500 mb-1">Comments:</Text>
            <Text className="text-base mb-2">{maintenance.comments}</Text>
          </View>
          {/* Completion Report */}
          {isCompleted && (
            <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
              <Text className="text-lg mb-3">Completion Report</Text>
              <Text className="text-gray-500 mb-1">Completed on:</Text>
              <Text className="text-base mb-2">{maintenance.completionDate ? new Date(maintenance.completionDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : '-'}</Text>
              <Text className="text-gray-500 mb-1">Work Done:</Text>
              <View className="mb-3">
                {maintenance.workDone && maintenance.workDone.length > 0 ? (
                  maintenance.workDone.map((item, idx) => (
                    <Text key={idx} className="text-base mb-1">• {item}</Text>
                  ))
                ) : (
                  <Text className="text-base">-</Text>
                )}
              </View>
              <Text className="text-gray-500 mb-1">Technician Comments:</Text>
              <Text className="text-base mb-2">{maintenance.technicianComments || '-'}</Text>
            </View>
          )}
        </View>
        {/* Status at the bottom */}
        <View className="items-center mt-8 mb-8">
          {isCompleted ? (
            <View className="items-center">
              <SuccessIcon  width={45} height={45}/>
              <Text className="text-green-600 text-xl mb-1 mt-4">Maintenance Completed</Text>
              <Text className="text-gray-500 text-lg">All checks passed</Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center mb-2">
                <Text style={{ fontSize: 36, color: '#f97316' }}>⏳</Text>
              </View>
              <Text className="text-orange-600 text-xl mb-1 mt-2">Maintenance In Progress</Text>
              <Text className="text-gray-500">Awaiting completion</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
} 