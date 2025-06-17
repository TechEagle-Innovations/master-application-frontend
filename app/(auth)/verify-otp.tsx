import Button from "@/components/auth/Button";
import { Error } from "@/components/Error";
import authNavigation from '@/utils/auth/navigation';
import { useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authService } from '@/utils/api/services/AuthService';

const OTPInput = ({
  value,
  onChange,
  length = 6
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}) => {
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    // Pre-fill refs array
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    const finalValue = newValue.join('');
    onChange(finalValue);

    // Move to next input if there's a value
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between w-full">
      {[...Array(length)].map((_, index) => (
        <TextInput
          key={index}
          ref={el => {
            if (el) inputRefs.current[index] = el;
          }}
          className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl font-semibold"
          maxLength={1}
          keyboardType="number-pad"
          value={value[index] || ''}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
};

const maskEmail = (email: string) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  const maskedName = name[0] + '*'.repeat(name.length - 1);
  return `${maskedName}@${domain}`;
};

// Usage:

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { email } = useLocalSearchParams<{ email: string }>();

  // Defensive check for email
  if (!email) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 text-lg font-bold">Email is missing. Please go back and enter your email.</Text>
      </View>
    );
  }

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;
    if (!email) {
      setError('Email is missing. Please go back and enter your email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use correct field name for backend
      const response = await authService.verifyOTP(email, otp);
      const message = (response as { message?: string })?.message || 'OTP verified.';

      Alert.alert('Success', message);
      // Update navigation to not require token
      authNavigation.goToResetPassword({ email });
    } catch (error: any) {
      setError(error?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = () => {
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return false;
    }

    if (!/^\d+$/.test(otp)) {
      setError('OTP should contain only numbers');
      return false;
    }

    return true;
  };

  const handleResendOTP = async () => {
    try {
      setError(null);
      await authService.forgotPassword(email);
      Alert.alert('Success', 'A new verification code has been sent to your email');
    } catch (error) {
      setError(error?.message || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center mt-6 mb-5 p-4 ">
        <TouchableOpacity
          onPress={authNavigation.goBack}
          className="p-2"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 p-7 pb-28">
        <View className="mb-2">

          <Text className="text-3xl font-bold">Enter OTP</Text>
        </View>
        <View className="space-y-6">
          <View className="space-y-2">
            <Text className="text-gray-600 text-base">
              OTP has been sent to
            </Text>
            <Text className="text-gray-600 text-base">
              {maskEmail(email)}
            </Text>
          </View>

          <View className="py-4">
            <Text className="text-base mb-4 text-lg">Enter OTP</Text>
            <OTPInput
              value={otp}
              onChange={setOtp}
              length={6}
            />
          </View>

          <Button loading={loading} actionFunction={handleVerifyOTP} buttonText="Verify Code" buttonTextLoading="Verifying..." />

          <TouchableOpacity
            onPress={handleResendOTP}
            className="mt-4"
          >
            <Text className="text-primary text-center text-base">
              Didn't receive the code? Resend
            </Text>
            {error && <Error error={error} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 