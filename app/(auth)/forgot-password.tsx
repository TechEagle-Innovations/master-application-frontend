import Logo from "@/assets/images/logo.svg";
import Button from "@/components/auth/Button";
import EmailInput from '@/components/auth/EmailInput';
import { Error } from "@/components/Error";
import authNavigation from '@/utils/auth/navigation';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetOTP = async () => {
    if (!validateEmail()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:6000/user/forgot-password', {
        email,
      });

      if (response.data) {
        authNavigation.goToVerifyOTP({ email });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      // Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = () => {
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
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
          <Text className="text-3xl font-bold">Forgot Password</Text>
        </View>

        <View className="space-y-6">
          <Text className="text-gray-600 text-base mb-10">
            Enter your email address and we'll send you a code to reset your password
          </Text>
          <EmailInput
            label="Email Address"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              setError(null);
            }}
            placeholder="Enter your email"
          />
          <Button loading={loading} actionFunction={handleGetOTP} buttonText="Get Verification Code" buttonTextLoading="Sending Code..." />
          {error && <Error error={error} />}
        </View>
      </View>
    </View>
  );
} 