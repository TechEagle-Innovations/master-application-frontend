import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-6 flex gap-3">
      <Text className="text-gray-700 text-lg font-medium mb-1">{label}</Text>
      <View className="flex-row items-center border-b border-gray-300">
        <TextInput
          className="flex-1 py-3 px-0 text-lg"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          className="pr-3"
        >
          {showPassword ? (
            <EyeOff size={20} color="#6B7280" />
          ) : (
            <Eye size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// export { PasswordInput };
export default PasswordInput; 