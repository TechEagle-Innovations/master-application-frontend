import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { CalendarDays } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// --- Constants ---
const REASONS = [
  'Battery Issue',
  'Propeller Damage',
  'Sensor Malfunction',
  'Software Error',
  'Other',
];

// --- Validation ---
const validateForm = (date: Date | null, reason: string, comment: string) => {
  const errors: { date?: string; reason?: string; comment?: string } = {};
  if (!date) errors.date = 'Please select a maintenance date.';
  if (!reason) errors.reason = 'Please select a reason.';
  if (!comment || comment.trim().length < 5) errors.comment = 'Please enter a comment (min 5 characters).';
  return errors;
};

// --- Main Component ---
export default function ReportIssue() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ date?: string; reason?: string; comment?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Handlers ---
  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    setApiError(null);
    setSuccess(false);
    const validationErrors = validateForm(date, reason, comment);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      // Simulate API call (replace with real API call)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
      setDate(null);
      setReason('');
      setComment('');
    } catch (err: any) {
      setApiError(err?.message || 'Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [date, reason, comment]);

  // --- Render ---
  return (
    <View className="flex-1 bg-white">
      <Header text="Report an Issue" insets={insets} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom, paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 mb-2">
          {/* Date Picker */}
          <Text className="text-lg font-semibold text-gray-800 mb-2">Select Date</Text>
          <TouchableOpacity
            className={`border ${errors.date ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-4 flex-row items-center justify-between mb-2 bg-white`}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Choose Report Date"
          >
            <Text className={`text-base ${date ? 'text-gray-800' : 'text-gray-400'}`}>{date ? date.toLocaleDateString() : 'Choose Report Date'}</Text>
            <CalendarDays size={22} color="#bdbdbd" />
          </TouchableOpacity>
          {errors.date && <Text className="text-red-500 text-xs mb-2">{errors.date}</Text>}
          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
              onChange={handleDateChange}
            />
          )}

          {/* Reason Picker */}
          <Text className="text-lg font-semibold text-gray-800 mb-2 mt-2">Select Reason</Text>
          <View className={`border ${errors.reason ? 'border-red-400' : 'border-gray-200'} rounded-xl mb-2 bg-white`}>
            <Picker
              selectedValue={reason}
              onValueChange={(itemValue) => setReason(itemValue)}
              accessibilityLabel="Select Issue Reason"
            >
              <Picker.Item label="Select Issue" value="" color="#bdbdbd" />
              {REASONS.map((r) => (
                <Picker.Item key={r} label={r} value={r} />
              ))}
            </Picker>
          </View>
          {errors.reason && <Text className="text-red-500 text-xs mb-2">{errors.reason}</Text>}

          {/* Comment */}
          <Text className="text-lg font-semibold text-gray-800 mb-2 mt-2">Comment</Text>
          <TextInput
            className={`border ${errors.comment ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-4 mb-2 text-base text-gray-800 bg-white`}
            placeholder="Add additional notes about maintenance"
            placeholderTextColor="#bdbdbd"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
            accessibilityLabel="Add additional notes about maintenance"
          />
          {errors.comment && <Text className="text-red-500 text-xs mb-2">{errors.comment}</Text>}

          {/* API Error */}
          {apiError && <Text className="text-red-500 text-center mb-2">{apiError}</Text>}

          {/* Success Message */}
          {success && (
            <View className="bg-green-100 rounded-xl p-4 mb-2">
              <Text className="text-green-700 text-center text-base">Issue reported successfully!</Text>
            </View>
          )}

          {/* Report Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mb-4 ${loading ? 'bg-orange-300' : 'bg-orange-500'}`}
            accessibilityRole="button"
            accessibilityLabel="Report maintenance issue"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-semibold">Report</Text>}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
} 