import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useShipment } from '../../utils/ShipmentContext';
import SuccessIcon from "@/assets/images/successIcon.svg"
import Header from '@/components/Header';

function Field({ label, value }: { label: string; value?: string | number | boolean }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View className="mb-2">
      <Text className="text-gray-500 mb-1">{label}</Text>
      <Text className="text-base">{String(value)}</Text>
    </View>
  );
}

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

const handleResolve = () => {
  router.push({
    pathname: '/(app)/resolve',
    params: { 
      maintenance: JSON.stringify(maintenance) 
    }
  });
};

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
            <Text className="text-lg font-bold">Drone #{maintenance.droneId}</Text>
            <View className={`w-3 h-3 rounded-full ${maintenance.isResolved ? 'bg-green-500' : 'bg-orange-500'}`} />
          </View>
          {/* Maintenance Details */}
          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
            <Text className="text-lg mb-3 font-bold">Issue Details</Text>
            <Field label="Maintenance ID" value={maintenance._id} />
            <Field label="Type" value={maintenance.maintenanceType} />
            <Field label="Status" value={maintenance.status} />
            <Field label="Reported By" value={maintenance.reportedBy} />
            <Field label="Description" value={maintenance.description} />
            <Field label="Priority" value={maintenance.priority} />
            <Field label="Issue Type" value={maintenance.issueType} />
            <Field label="Issue Severity" value={maintenance.issueSeverity} />
            <Field label="User Comments" value={maintenance.userComments} />
            <Field label="Resolved" value={maintenance.isResolved ? 'Yes' : 'No'} />
            <Field label="Created At" value={new Date(maintenance.createdAt).toLocaleString()} />
            <Field label="Updated At" value={new Date(maintenance.updatedAt).toLocaleString()} />
          </View>
          {/* Actions Taken */}
          {maintenance.actionsTaken && maintenance.actionsTaken.length > 0 && (
            <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
              <Text className="text-lg mb-3">Actions Taken</Text>
              {maintenance.actionsTaken.map((action, idx) => (
                <Text key={idx} className="text-base mb-1">• {String(action)}</Text>
              ))}
            </View>
          )}
          {/* Maintenance Checklist */}
          {maintenance.maintenanceChecklist && maintenance.maintenanceChecklist.length > 0 && (
            <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
              <Text className="text-lg mb-3">Maintenance Checklist</Text>
              {maintenance.maintenanceChecklist.map((item, idx) => (
                <Text key={idx} className="text-base mb-1">• {String(item)}</Text>
              ))}
            </View>
          )}
        </View>
        {/* Status at the bottom */}
        <View className="items-center mt-8 mb-8">
          {maintenance.isResolved ? (
            <View className="items-center">
              <SuccessIcon width={45} height={45} />
              <Text className="text-green-600 text-xl mb-1 mt-4">Maintenance Resolved</Text>
              <Text className="text-gray-500 text-lg">All checks passed</Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center mb-2">
                <Text style={{ fontSize: 36, color: '#f97316' }}>⏳</Text>
              </View>
              <Text className="text-orange-600 text-xl mb-1 mt-2">Maintenance In Progress</Text>
              <Text className="text-gray-500">Awaiting completion</Text>
              
              {/* Add Resolve Button only when maintenance is pending */}
              {maintenance.status === 'PENDING' && (
                <TouchableOpacity 
                  className="mt-6 bg-orange-600 py-3 px-6 rounded-lg"
                  onPress={handleResolve}
                >
                  <Text className="text-white font-medium">Resolve Maintenance</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}