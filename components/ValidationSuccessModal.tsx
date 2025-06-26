import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ValidationSuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

const ValidationSuccessModal: React.FC<ValidationSuccessModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  if (!visible) return null;
  return (
    <View className="absolute left-0 right-0 bottom-0 top-0 z-[100] bg-black/25 justify-end">
      <View className="bg-white rounded-t-3xl px-6 py-6 min-h-[320px] items-center">
        {/* <ValidationSuccessIcon width={80} height={80} style={{ marginBottom: 24 }} /> */}
        <Text className="text-2xl font-bold mb-8 text-primary">Parcel Validation</Text>
        <View className="bg-[#fff4ed] rounded-full p-5 mb-8">
          <Ionicons name="checkmark-circle" size={48} color="#ff670f" />
        </View>
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mt-2 w-full"
          onPress={() => router.push('/(app)/postflight-checklist')}
        >
          <Text className="text-white text-lg font-bold">Run Post-Flight Checklist</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ValidationSuccessModal;
