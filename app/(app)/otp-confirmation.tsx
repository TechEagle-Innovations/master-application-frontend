import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useOtp } from '../../hooks/useOtp';

const OTP_LENGTH = 6;

export default function OTPConfirmation() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { otp, setOtp, isComplete, error, loading, verifyOtp, reset } = useOtp(OTP_LENGTH);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, idx: number) => {
    if (!/^[0-9]?$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);
    if (text && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
    // If deleting, focus previous
    if (!text && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const success = await verifyOtp();
    if (success) {
      router.push('/(app)/parcel-validation');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 bg-white border-b border-gray-100" style={{ paddingTop: insets.top, minHeight: 56 + insets.top }}>
        <TouchableOpacity onPress={router.back} className="p-2" accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold mb-5">Delivery Confirmation</Text>
        <Text className="text-lg text-gray-500 mb-12">OTP has been sent to +91 99********5</Text>
        <Text className="text-xl font-medium mb-2">Enter OTP</Text>
        <View className="flex-row justify-between mb-8">
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={ref => { inputs.current[idx] = ref; }}
              value={digit}
              onChangeText={text => handleChange(text, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              className="w-16 h-16 border border-gray-300 rounded-lg text-center text-xl bg-white"
              style={{ marginHorizontal: 2 }}
              returnKeyType={idx === OTP_LENGTH - 1 ? 'done' : 'next'}
              onSubmitEditing={() => idx < OTP_LENGTH - 1 && inputs.current[idx + 1]?.focus()}
            />
          ))}
        </View>
        {error && <Text className="text-red-500 mb-2 text-center">{error}</Text>}
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          accessibilityRole="button"
          accessibilityLabel="Confirm OTP"
          onPress={handleConfirm}
          disabled={!isComplete || loading}
          style={{ opacity: !isComplete || loading ? 0.5 : 1 }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-semibold">Confirm OTP</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} className="mt-4" accessibilityRole="button" accessibilityLabel="Reset OTP">
          <Text className="text-blue-500 text-center">Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 