import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { useShipment } from "@/utils/ShipmentContext";
import Header from "@/components/Header";

// Define the shape of a session
interface ChargeSession {
  charge_start_time: string;
  charge_end_time: string;
  charging_hours: number;
  cell_voltage: Record<string, number>;
  maxVdiff: number;
  voltage_before_charge: number;
  voltage_after_charge: number;
  monitor_by: string;
  remark: string;
}

export default function ChargeSessionDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessionIndex } = useLocalSearchParams<{ sessionIndex: string }>();
  const { selectedBattery } = useShipment();

  // Retrieve session from selectedBattery.history
  const data: ChargeSession | null = React.useMemo(() => {
    const idx = sessionIndex ? parseInt(sessionIndex, 10) : NaN;
    if (
      selectedBattery?.history &&
      !isNaN(idx) &&
      idx >= 0 &&
      idx < selectedBattery.history.length
    ) {
      return selectedBattery.history[idx] as ChargeSession;
    }
    return null;
  }, [selectedBattery, sessionIndex]);

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">Session data not found.</Text>
      </View>
    );
  }

  const formatDateTime = (iso: string) => {
    const dt = new Date(iso);
    const date = dt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const time = dt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} ${time}`;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      {/* <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold">Charging Session</Text>
        <View style={{ width: 24 }} />
      </View> */}
      <Header insets={insets} text="Charging Detials" />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Card 1: Charging Duration */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold mb-3">Charging Duration</Text>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-gray-500">Start Time</Text>
              <Text className="text-base mb-2">
                {formatDateTime(data.charge_start_time)}
              </Text>

              <Text className="text-gray-500">End Time</Text>
              <Text className="text-base mb-2">
                {formatDateTime(data.charge_end_time)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500">Total Hours</Text>
              <Text className="text-base">
                {data.charging_hours.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Card 2: Voltage Measurements */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold mb-3">
            Voltage Measurements
          </Text>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-gray-500">Cell Voltage</Text>
              <View className="mb-2">
                {Object.entries(data.cell_voltage).map(([cell, volt]) => (
                  <Text key={cell} className="text-base">
                    {cell}: {volt.toFixed(2)}V
                  </Text>
                ))}
              </View>

              <Text className="text-gray-500">Max VDiff</Text>
              <Text className="text-base">{data.maxVdiff.toFixed(2)}V</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500">Before Charging</Text>
              <Text className="text-base mb-2">
                {data.voltage_before_charge.toFixed(2)}V
              </Text>

              <Text className="text-gray-500">After Charging</Text>
              <Text className="text-base">
                {data.voltage_after_charge.toFixed(2)}V
              </Text>
            </View>
          </View>
        </View>

        {/* Card 3: Monitor & Remarks */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="text-gray-500">Monitored By</Text>
          <Text className="text-base mb-4">{data.monitor_by}</Text>

          <Text className="text-gray-500">Remarks</Text>
          <Text className="text-base">{data.remark}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
