import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Button from '@/components/auth/Button';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/utils/auth/AuthContext';
import { batteryService } from '@/utils/api/services/BatteryService';

export default function AfterCharging() {
  const insets = useSafeAreaInsets();
  const { noOfCells, voltage, startTime, batteryId } = useLocalSearchParams<{ noOfCells: string, voltage: string, startTime: string, batteryId: string }>();
  const [voltageAfter, setVoltageAfter] = useState('');
  const [cellVoltages, setCellVoltages] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const { user} =useAuth()
 console.log("START TIME", startTime);
 console.log("VOLTAGE", voltage);
  useEffect(() => {
    const count = parseInt(noOfCells || '0', 10);
    if (!isNaN(count) && count > 0) {
      setCellVoltages(Array(count).fill(''));
    }
  }, [noOfCells]);

  const handleVoltageChange = (index: number, value: string) => {
    const updated = [...cellVoltages];
    updated[index] = value;
    setCellVoltages(updated);
  };
  const sortCellVoltages = cellVoltages.map(v => parseFloat(v)).sort();
  const maxVdiff = sortCellVoltages[sortCellVoltages.length - 1] - sortCellVoltages[0];
  //create a hard code startTime for 1 hour ago from current time
  const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000).toISOString();
  const startChargeTime = startTime || oneHourAgo;
  console.log("START CHARGE TIME", startChargeTime);
  const stopCharging = {
    charge_start_time: startChargeTime,
    charge_end_time: new Date().toISOString(),
    cell_voltage: cellVoltages.reduce((acc, v, i) => ({ ...acc, [`V${i + 1}`]: parseFloat(v) }), {}),
    maxVdiff: maxVdiff,
    voltage_before_charge: parseFloat(voltage || '0'),
    voltage_after_charge: parseFloat(voltageAfter),
    remark: remarks,
    monitor_by: user?.email, 
  }

  const handleDone = async () => {
    setLoading(true);
    // TODO: Send voltageAfter, cellVoltages[], and remarks to backend
    try {
      const stopChargingResponse = await batteryService.stopCharging(batteryId, stopCharging);
      console.log('Stop Charging Response:', stopChargingResponse);
    } catch (error) {
      console.error('Error stopping charging:', error);
      // Handle error (e.g., show alert)
      
    }finally {
      setLoading(false);
      // Navigate back or show success message
    }

     
    
  };

  return (
    <View className="flex-1 bg-white">
      <Header insets={insets} text="After Charging Form" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Voltage After Charge */}
        <Text className="mb-1 text-gray-700">Voltage After Charge (V)</Text>
        <View className="flex-row items-center mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Enter voltage"
            value={voltageAfter}
            onChangeText={setVoltageAfter}
            keyboardType="numeric"
          />
          <Text className="ml-2 text-gray-500">V</Text>
        </View>

        {/* Dynamic Cell Voltages */}
        <Text className="mb-1 text-gray-700">Cell Voltages</Text>
        {cellVoltages.map((v, index) => (
          <View key={index}>
            <Text className="mb-1 text-gray-500">{`V${index + 1}`}</Text>
            <TextInput
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 text-base"
              placeholder={`Enter V${index + 1}`}
              value={v}
              onChangeText={(value) => handleVoltageChange(index, value)}
              keyboardType="numeric"
            />
          </View>
        ))}

        {/* Remarks */}
        <Text className="mb-1 text-gray-700">Remarks</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-8 text-base"
          placeholder="Enter any additional notes or remarks"
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={4}
        />

        {/* Done Button */}
        <Button
          loading={loading}
          actionFunction={handleDone}
          buttonText="Done"
          buttonTextLoading="Saving..."
        />
      </ScrollView>
    </View>
  );
}
