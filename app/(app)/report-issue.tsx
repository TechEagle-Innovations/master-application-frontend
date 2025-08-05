import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '@/components/Header';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/utils/auth/AuthContext';
import { maintainanceService } from '@/utils/api/services/MaintainanceService';

const ISSUE_TYPES = ['HARDWARE', 'SOFTWARE', 'OTHER'];
const ISSUE_SEVERITIES = ['MINOR', 'MAJOR', 'CRITICAL'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// --- Validation ---
const validateForm = (fields: any) => {
  const errors: Record<string, string> = {};
  if (!fields.droneId) errors.droneId = 'Drone ID is required.';
  if (!fields.reportedBy) errors.reportedBy = 'Reporter is required.';
  if (!fields.issueType) errors.issueType = 'Issue type is required.';
  if (!fields.issueSeverity) errors.issueSeverity = 'Issue severity is required.';
  return errors;
};

export default function ReportIssue() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const {user}=useAuth();
  const router = useRouter();
  console.log(user);
  const [fields, setFields] = useState({
    droneId: params.id || '',
    reportedBy: user?.id,
    description: '',
    issueType: '',
    issueSeverity: '',
    userComments: '',
    priority: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Handlers ---
  const handleFieldChange = (key: string, value: any) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!user || !user.id) {
      setApiError('User not loaded. Please log in again.');
      return;
    }
    setErrors({});
    setApiError(null);
    setSuccess(false);
    const validationErrors = validateForm(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      console.log('Submitting issue with fields:', fields);
      const data = await maintainanceService.reportIssue(fields);
      console.log('API response:', data);
      setSuccess(true);
      setFields({
        droneId: params.id || '',
        reportedBy: user.id,
        description: '',
        issueType: '',
        issueSeverity: '',
        userComments: '',
        priority: ''
      });
      setTimeout(() => {
        router.replace({ pathname: '/(app)/drone-detail', params: { id: params.id, message: 'Issue reported successfully!', type:"success" } });
      }, 200);
    } catch (err: any) {
      console.error('API error:', err);
      setApiError(err?.message || 'Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fields, params.id, user, router]);

  
  return (
    <View className="flex-1 bg-white">
      <Header text="Report an Issue" insets={insets} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom, paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 mb-2">
          {/* Drone ID */}
          <Text className="text-lg text-gray-800 mb-2">Drone ID</Text>
          <TextInput
            className={`border ${errors.droneId ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-4 mb-2 text-base text-gray-800 bg-white`}
            placeholder="Enter Drone ID"
            placeholderTextColor="#bdbdbd"
            value={fields.droneId}
            onChangeText={(v) => handleFieldChange('droneId', v)}
            accessibilityLabel="Drone ID"
          />
          {errors.droneId && <Text className="text-red-500 text-xs mb-2">{errors.droneId}</Text>}

          {/* Description */}
          <Text className="text-lg text-gray-800 mb-2 mt-2">Description</Text>
          <TextInput
            className={`border border-gray-200 rounded-xl px-4 py-4 mb-2 text-base text-gray-800 bg-white`}
            placeholder="Describe the issue (optional)"
            placeholderTextColor="#bdbdbd"
            value={fields.description}
            onChangeText={(v) => handleFieldChange('description', v)}
            multiline
            numberOfLines={3}
            style={{ minHeight: 60, textAlignVertical: 'top' }}
            accessibilityLabel="Description"
          />

          {/* Issue Type */}
          <Text className="text-lg text-gray-800 mb-2 mt-2">Issue Type</Text>
          <View className={`border ${errors.issueType ? 'border-red-400' : 'border-gray-200'} rounded-xl mb-2 bg-white`}>
            <Picker
              selectedValue={fields.issueType}
              onValueChange={(v) => handleFieldChange('issueType', v)}
              accessibilityLabel="Select Issue Type"
            >
              <Picker.Item label="Select Issue Type" value="" color="#bdbdbd" />
              {ISSUE_TYPES.map((t) => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>
          </View>
          {errors.issueType && <Text className="text-red-500 text-xs mb-2">{errors.issueType}</Text>}

          {/* Issue Severity */}
          <Text className="text-lg text-gray-800 mb-2 mt-2">Issue Severity</Text>
          <View className={`border ${errors.issueSeverity ? 'border-red-400' : 'border-gray-200'} rounded-xl mb-2 bg-white`}>
            <Picker
              selectedValue={fields.issueSeverity}
              onValueChange={(v) => handleFieldChange('issueSeverity', v)}
              accessibilityLabel="Select Issue Severity"
            >
              <Picker.Item label="Select Severity" value="" color="#bdbdbd" />
              {ISSUE_SEVERITIES.map((s) => (
                <Picker.Item key={s} label={s} value={s} />
              ))}
            </Picker>
          </View>
          {errors.issueSeverity && <Text className="text-red-500 text-xs mb-2">{errors.issueSeverity}</Text>}

          {/* User Comments */}
          <Text className="text-lg text-gray-800 mb-2 mt-2">User Comments</Text>
          <TextInput
            className={`border border-gray-200 rounded-xl px-4 py-4 mb-2 text-base text-gray-800 bg-white`}
            placeholder="Additional comments (optional)"
            placeholderTextColor="#bdbdbd"
            value={fields.userComments}
            onChangeText={(v) => handleFieldChange('userComments', v)}
            multiline
            numberOfLines={2}
            style={{ minHeight: 40, textAlignVertical: 'top' }}
            accessibilityLabel="User Comments"
          />

          {/* Priority */}
          <Text className="text-lg text-gray-800 mb-2 mt-2">Priority</Text>
          <View className={`border border-gray-200 rounded-xl mb-2 bg-white`}>
            <Picker
              selectedValue={fields.priority}
              onValueChange={(v) => handleFieldChange('priority', v)}
              accessibilityLabel="Select Priority"
            >
              <Picker.Item label="Select Priority" value="" color="#bdbdbd" />
              {PRIORITIES.map((p) => (
                <Picker.Item key={p} label={p} value={p} />
              ))}
            </Picker>
          </View>

         
          {apiError && <Text className="text-red-500 text-center mb-2">{apiError}</Text>}

          {/* Success Message */}
          {/* {success && (
            <View className="bg-green-100 rounded-xl p-4 mb-2">
              <Text className="text-green-700 text-center text-base">Issue reported successfully!</Text>
            </View>
          )} */}

          {/* Report Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mb-4 ${loading || !user ? 'bg-orange-300' : 'bg-orange-500'}`}
            accessibilityRole="button"
            accessibilityLabel="Report maintenance issue"
            onPress={handleSubmit}
            disabled={loading || !user}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-semibold">Report</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
} 