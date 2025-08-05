import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    ScrollView,
  } from 'react-native';
  import React from 'react';
  import { BatteryAPI } from '@/app/(app)/battery';
  
  type Props = {
    visible: boolean;
    setVisible: (v: boolean) => void;
    voltages: string[];
    setVoltages: (voltages: string[]) => void;
    disconnectLoading: boolean;
    batteries: BatteryAPI[];
    handleDisconnect: () => void;
  };
  
  const DisconnectBatteryModal = ({
    visible,
    setVisible,
    voltages,
    setVoltages,
    disconnectLoading,
    batteries,
    handleDisconnect,
  }: Props) => {
    const handleVoltageChange = (index: number, value: string) => {
      const updated = [...voltages];
      updated[index] = value;
      setVoltages(updated);
    };
  
    const allFilled =
      voltages.length === batteries.length &&
      voltages.every(v => !!v.trim() && !isNaN(Number(v)));
  
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 bg-black/30 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-h-[80%]">
            <Text className="text-xl font-semibold mb-2 text-center">Disconnect Batteries</Text>
            <Text className="text-gray-500 mb-4 text-center">
              Please enter end voltage for each battery
            </Text>
  
            {batteries.length === 0 ? (
              <Text className="text-red-500 text-center mb-4">No batteries available</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {batteries.map((b, i) => (
                  <View key={b._id || i} className="mb-3">
                    <Text className="text-gray-600 mb-1">{`${b.battery_id || 'Unknown ID'}`}</Text>
                    <TextInput
                      className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                      placeholder={`Voltage for Battery ${i + 1}`}
                      keyboardType="numeric"
                      value={voltages[i] || ''}
                      onChangeText={value => handleVoltageChange(i, value)}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
  
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-gray-200 rounded-xl py-3 px-6 flex-1 mr-2 items-center"
                onPress={() => setVisible(false)}
                disabled={disconnectLoading}
              >
                <Text className="text-gray-700 text-lg font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-orange-500 rounded-xl py-3 px-6 flex-1 ml-2 items-center"
                onPress={handleDisconnect}
                disabled={disconnectLoading || !allFilled}
              >
                {disconnectLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-lg font-semibold">Disconnect</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  export default DisconnectBatteryModal;
  