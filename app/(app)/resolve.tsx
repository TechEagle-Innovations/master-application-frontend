import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { maintainanceService } from '@/utils/api/services/MaintainanceService';
import { router } from 'expo-router';
import { useShipment } from '@/utils/ShipmentContext';

type MaintenanceAction = {
  action: string;
  performedAt: Date;
  notes: string;
  performedBy: string;
};

export type DroneMaintenance = {
  _id: string;
  droneId: string;
  maintenanceType: 'REGULAR' | 'ISSUE_REPORTED';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate?: string;
  description: string;
  actionsTaken: MaintenanceAction[];
  isResolved: boolean;
  resolutionNotes?: string;
  nextScheduledDate?: string;
  maintenanceInterval?: string;
};

type ParamList = {
  ResolveMaintenance: {
    maintenance: string;
    userId: string;
  };
};

type ResolveMaintenanceForm = {
  status: 'COMPLETED' | 'CANCELLED';
  isResolved: boolean;
  resolutionNotes: string;
  actionsTaken: MaintenanceAction[];
  nextScheduledDate?: string;
  maintenanceInterval?: string;
};

const isValidDate = (dateString: string): boolean => {
  return !isNaN(Date.parse(dateString));
};

export default function ResolveMaintenanceScreen() {
  const route = useRoute<RouteProp<ParamList, 'ResolveMaintenance'>>();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const userId = route.params.userId;
  const { maintenance } = useShipment();

  const [formData, setFormData] = useState<ResolveMaintenanceForm>({
    status: maintenance?.status === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED',
    isResolved: maintenance?.isResolved || false,
    resolutionNotes: maintenance?.userComments || '',
    actionsTaken: maintenance?.actionsTaken || [],
    nextScheduledDate: maintenance?.nextScheduledDate,
    maintenanceInterval: maintenance?.maintenanceInterval
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.resolutionNotes.trim()) {
      newErrors.resolutionNotes = 'Resolution notes are required';
    }

    if (formData.status === 'COMPLETED' && !formData.isResolved) {
      newErrors.isResolved = 'Cannot mark as completed without resolving';
    }

    if (formData.status === 'COMPLETED' && formData.actionsTaken.length === 0) {
      newErrors.actionsTaken = 'At least one action is required';
    } else {
      const emptyActionIndex = formData.actionsTaken.findIndex(a => !a.action.trim());
      if (emptyActionIndex >= 0) {
        newErrors.actionsTaken = `Action ${emptyActionIndex + 1} description is required`;
      }
    }

    if (maintenance?.maintenanceType === 'REGULAR' && formData.status === 'COMPLETED') {
      if (!formData.nextScheduledDate) {
        newErrors.nextScheduledDate = 'Next scheduled date is required';
      } else if (!isValidDate(formData.nextScheduledDate)) {
        newErrors.nextScheduledDate = 'Invalid date format (use YYYY-MM-DD)';
      }

      if (!formData.maintenanceInterval) {
        newErrors.maintenanceInterval = 'Maintenance interval is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleActionAdd = () => {
    setFormData(prev => ({
      ...prev,
      actionsTaken: [
        ...prev.actionsTaken,
        {
          action: '',
          performedAt: new Date(),
          notes: '',
          performedBy: userId
        }
      ]
    }));
  };

  const handleActionUpdate = (index: number, field: keyof MaintenanceAction, value: string) => {
    const updated = [...formData.actionsTaken];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, actionsTaken: updated }));
    setErrors(prev => ({ ...prev, actionsTaken: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!maintenance) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        actionsTaken: formData.actionsTaken.map(action => ({
          ...action,
          performedBy: userId
        }))
      };

      const response: any = await maintainanceService.resolveMaintaince(maintenance._id, payload);

      if (!response.ok) {
        // const errorData = await response.json();
        throw new Error('Failed to submit maintenance resolution');
      }

      Alert.alert(
        'Success',
        'Maintenance resolved successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      router.back();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to submit maintenance resolution'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Not scheduled';
    const date = new Date(iso);
    return date.toLocaleDateString();
  };

  if (!maintenance) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Maintenance data not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="mb-5">
        <Text className="text-xl font-bold text-gray-800">
          {maintenance.maintenanceType === 'REGULAR' ? 'Regular Maintenance' : 'Issue Resolution'}
        </Text>
        <Text className="text-sm text-gray-600">Drone ID: {maintenance.droneId}</Text>
      </View>

      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-bold mb-2 border-b border-gray-200 pb-1">Details</Text>
        <View className="mb-2">
          <Text className="text-sm font-medium text-gray-700">Description:</Text>
          <Text className="text-sm text-gray-600 mt-1">{maintenance.description}</Text>
        </View>
        {maintenance.maintenanceType === 'REGULAR' && (
          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700">Scheduled Date:</Text>
            <Text className="text-sm text-gray-600 mt-1">
              {formatDate(maintenance.scheduledDate)}
            </Text>
          </View>
        )}
      </View>

      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-bold mb-2 border-b border-gray-200 pb-1">Resolution Notes</Text>
        <TextInput
          className={`border rounded-md p-2 text-sm h-24 ${errors.resolutionNotes ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Describe the resolution..."
          multiline
          value={formData.resolutionNotes}
          onChangeText={text => {
            setFormData(prev => ({ ...prev, resolutionNotes: text }));
            setErrors(prev => ({ ...prev, resolutionNotes: '' }));
          }}
        />
        {errors.resolutionNotes && (
          <Text className="text-red-500 text-xs mt-1">{errors.resolutionNotes}</Text>
        )}
      </View>

      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-2 border-b border-gray-200 pb-1">
          <Text className="text-lg font-bold">Actions Taken</Text>
          <TouchableOpacity onPress={handleActionAdd}>
            <MaterialIcons name="add-circle" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {errors.actionsTaken && (
          <Text className="text-red-500 text-xs mb-2">{errors.actionsTaken}</Text>
        )}

        {formData.actionsTaken.map((action, index) => (
          <View key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
            <Text className="text-sm font-medium text-gray-700 mb-1">Action {index + 1}</Text>
            <TextInput
              className={`border rounded-md p-2 text-sm mb-2 ${!action.action.trim() && errors.actionsTaken ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Describe the action..."
              value={action.action}
              onChangeText={text => handleActionUpdate(index, 'action', text)}
            />
            <TextInput
              className="border border-gray-300 rounded-md p-2 text-sm h-20"
              placeholder="Notes..."
              multiline
              value={action.notes}
              onChangeText={text => handleActionUpdate(index, 'notes', text)}
            />
          </View>
        ))}

        {formData.actionsTaken.length === 0 && (
          <Text className="text-gray-500 text-sm italic">No actions added yet</Text>
        )}
      </View>

      {maintenance.maintenanceType === 'REGULAR' && (
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold mb-2 border-b border-gray-200 pb-1">Next Maintenance</Text>
          
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-1">Next Scheduled Date</Text>
            <TextInput
              className={`border rounded-md p-2 text-sm ${errors.nextScheduledDate ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="YYYY-MM-DD"
              value={formData.nextScheduledDate}
              onChangeText={text => {
                setFormData(prev => ({ ...prev, nextScheduledDate: text }));
                setErrors(prev => ({ ...prev, nextScheduledDate: '' }));
              }}
            />
            {errors.nextScheduledDate && (
              <Text className="text-red-500 text-xs mt-1">{errors.nextScheduledDate}</Text>
            )}
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-1">Maintenance Interval</Text>
            <View className={`border rounded-md ${errors.maintenanceInterval ? 'border-red-500' : 'border-gray-300'}`}>
              <Picker
                selectedValue={formData.maintenanceInterval}
                onValueChange={value => {
                  setFormData(prev => ({ ...prev, maintenanceInterval: value }));
                  setErrors(prev => ({ ...prev, maintenanceInterval: '' }));
                }}
              >
                <Picker.Item label="Select interval" value="" />
                <Picker.Item label="Daily" value="daily" />
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Monthly" value="monthly" />
                <Picker.Item label="Quarterly" value="quarterly" />
                <Picker.Item label="Yearly" value="yearly" />
              </Picker>
            </View>
            {errors.maintenanceInterval && (
              <Text className="text-red-500 text-xs mt-1">{errors.maintenanceInterval}</Text>
            )}
          </View>
        </View>
      )}

      <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <Text className="text-lg font-bold mb-2 border-b border-gray-200 pb-1">Status</Text>
        <View className="border border-gray-300 rounded-md">
          <Picker
            selectedValue={formData.status}
            onValueChange={value => {
              setFormData(prev => ({ ...prev, status: value }));
              setErrors(prev => ({ ...prev, isResolved: '' }));
            }}
          >
            <Picker.Item label="Completed" value="COMPLETED" />
            <Picker.Item label="Cancelled" value="CANCELLED" />
          </Picker>
        </View>

        {formData.status === 'COMPLETED' && (
          <View className="mt-3 flex-row items-center">
            <TouchableOpacity
              className={`w-5 h-5 rounded-md border mr-2 ${formData.isResolved ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
              onPress={() => {
                setFormData(prev => ({ ...prev, isResolved: !prev.isResolved }));
                setErrors(prev => ({ ...prev, isResolved: '' }));
              }}
            >
              {formData.isResolved && <MaterialIcons name="check" size={16} color="white" />}
            </TouchableOpacity>
            <Text className="text-sm">Mark as resolved</Text>
          </View>
        )}
        {errors.isResolved && (
          <Text className="text-red-500 text-xs mt-1">{errors.isResolved}</Text>
        )}
      </View>

      <TouchableOpacity
        className={`py-3 rounded-lg items-center mb-10 ${isSubmitting ? 'bg-blue-300' : 'bg-blue-500'}`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text className="text-white font-bold text-lg">
          {isSubmitting ? 'Submitting...' : 'Submit Resolution'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}