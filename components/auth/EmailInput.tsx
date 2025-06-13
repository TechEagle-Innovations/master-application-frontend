import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface EmailInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

const EmailInput: React.FC<EmailInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder 
}) => (
  <View className="mb-6 flex gap-3">
    <Text className="text-gray-700 text-lg font-medium mb-1">{label}</Text>
    <TextInput
      className="w-full py-3 px-0 border-b border-gray-300 text-lg"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType="email-address"
      autoCapitalize="none"
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

// export { EmailInput };
export default EmailInput; 