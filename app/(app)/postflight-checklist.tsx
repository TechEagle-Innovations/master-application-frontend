import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/utils/auth/AuthContext';
import { flightService } from '@/utils/api/services/FlightService';
import PhotoChecklist, { ChecklistItem } from '@/components/PhotoChecklist';
import { useShipment } from '@/utils/ShipmentContext';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import DisconnectBatteryModal from '@/components/BatteryDisconnectModal';
import { batteryService } from '@/utils/api/services/BatteryService';
import { BatteryAPI } from '@/app/(app)/battery';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your internet connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  DATA_ERROR: 'Invalid data received from server.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  INCOMPLETE_CHECKLIST: 'Please complete all checklist items before submitting.',
};

export default function PostFlightChecklist() {
  const router = useRouter();
  const { clearskyToken } = useAuth();
  const { selectedFlight } = useShipment();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [voltages, setVoltages] = useState<string[]>([]);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [batteries, setBatteries] = useState<BatteryAPI[]>([]);
  const [isChecklistDone, setIsCheckListDone] = useState<boolean>(false);

  // Fetch checklist items
  const fetchChecklistItems = useCallback(async () => {
    if (!clearskyToken) throw new Error(ERROR_MESSAGES.AUTH_ERROR);
    const response: any = await flightService.getPostFlight({
      headers: { "x-auth-clearsky": clearskyToken }
    });
    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error(ERROR_MESSAGES.DATA_ERROR);
    }
    return response.data;
  }, [clearskyToken]);

  // Submit checklist
  const submitChecklist = useCallback(async (items: ChecklistItem[]) => {
    try {
      const updates = items.map((item, idx) => ({
        ...item,
        image: "https://image.jpg",
      }));
      await flightService.completePostFlight(
        { updates },
        { headers: { "x-auth-clearsky": clearskyToken } }
      );
      setIsCheckListDone(true);
    } catch (error) {
      console.log(error);
    }
  }, [clearskyToken]);

  // Disconnect logic
  const handleDisconnect = async () => {
    try {
      setDisconnectLoading(true);

      if (!selectedFlight?.end_location) {
        Alert.alert('Error', 'Flight end location is missing.');
        return;
      }

      const batteryVoltages = batteries.reduce((acc, battery, index) => {
        const voltage = parseFloat(voltages[index]);
        if (battery.battery_id && !isNaN(voltage)) {
          acc[battery.battery_id] = voltage;
        }
        return acc;
      }, {} as Record<string, number>);

      if (Object.keys(batteryVoltages).length !== batteries.length) {
        Alert.alert('Error', 'Please enter voltage for all batteries.');
        return;
      }

      const payload = {
        all_Battery: batteries.map(b => b.battery_id!).filter(Boolean),
        batteryVoltages,
        end_location: selectedFlight.end_location,
      };

      const res = await batteryService.disconnectBattery(payload);
      console.log('Battery disconnect success:', res);

      Alert.alert('Success', 'Batteries disconnected successfully.', [
        {
          text: 'OK',
          onPress: () => {
            setVisible(false);
            router.push('/(app)/post-parcel-validation');
          },
        },
      ]);
    } catch (error) {
      console.error('Battery disconnect error:', error);
      Alert.alert('Error', 'Failed to disconnect batteries. Please try again.');
    } finally {
      setDisconnectLoading(false);
    }
  };

  const handlePopupVisible = async () => {
    try {
      const res = await batteryService.getBatteries();
      const filtered = (res as BatteryAPI[]).filter(b => b.current_flight_id == selectedFlight?._id);
      setBatteries(filtered);
      setVoltages(Array(filtered.length).fill(''));
      setVisible(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to load batteries');
    }
  };

  return (
    <View className="flex-1 bg-white px-4 py-6">
      {!isChecklistDone && <PhotoChecklist
        headerText="Post-Flight Checklist"
        fetchChecklistItems={fetchChecklistItems}
        submitChecklist={submitChecklist}
      />}

      {isChecklistDone && (
        // <TouchableOpacity
        //   testID="submit-button"
        //   className="bg-primary rounded-xl py-4 items-center mt-4"
        //   accessibilityRole="button"
        //   accessibilityLabel="Submit checklist"
        //   onPress={handlePopupVisible}
        // >
        //   <Text className="text-white font-semibold text-lg">Disconnect Battery</Text>
        // </TouchableOpacity>
        <View style={{ position: 'absolute', bottom: insets.bottom + 20, left: 16, right: 16 }}>
          <TouchableOpacity
            testID="submit-button"
            className="bg-primary rounded-xl py-4 items-center"
            accessibilityRole="button"
            accessibilityLabel="Submit checklist"
            onPress={handlePopupVisible}
          >
            <Text className="text-white font-semibold text-lg">Disconnect Battery</Text>
          </TouchableOpacity>
        </View>
      )}

      <DisconnectBatteryModal
        visible={visible}
        setVisible={setVisible}
        voltages={voltages}
        setVoltages={setVoltages}
        disconnectLoading={disconnectLoading}
        batteries={batteries}
        handleDisconnect={handleDisconnect}
      />
    </View>
  );
}
