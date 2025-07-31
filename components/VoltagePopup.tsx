import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface VoltagePopupProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (voltage: number, timestamp: string) => void;
}

export default function VoltagePopup({ visible, onCancel, onConfirm }: VoltagePopupProps) {
  const [input, setInput] = useState('');

  const handleConfirm = () => {
    const parsed = parseFloat(input);
    if (isNaN(parsed) || parsed <= 0) {
      // optionally show a validation error
      return;
    }
    onConfirm(parsed, new Date().toISOString());
    setInput('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center">
        <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
          <Text className="text-xl font-semibold text-center mb-1">Current Battery Voltage</Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            Please enter the current battery voltage
          </Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Voltage (e.g. 12.5)"
            keyboardType="numeric"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
          />
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
              onPress={onCancel}
            >
              <Text className="text-lg text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-orange-500 rounded-lg py-3 items-center"
              onPress={handleConfirm}
            >
              <Text className="text-lg text-white">Charge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
