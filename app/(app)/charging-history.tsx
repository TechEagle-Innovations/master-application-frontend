import Header from "@/components/Header";
import { useShipment } from "@/utils/ShipmentContext";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

const filters = [
  { key: "ALL", label: "All", daysAgo: null },
  { key: "7D", label: "Last 7 Days", daysAgo: 7 },
  { key: "30D", label: "Last 30 Days", daysAgo: 30 },
  { key: "3M", label: "Last 3 Months", daysAgo: 90 },
];

export default function ChargeHistoryScreen() {
  const [activeFilter, setActiveFilter] = useState(filters[0].key);
  const insets = useSafeAreaInsets();
  const { selectedBattery } = useShipment();

  // Normalize and prepare backend data
  const historyData = useMemo(() => {
    if (!selectedBattery?.history) return [];
    return selectedBattery.history.map((item, index) => {
      const start = new Date(item.charge_start_time ?? "");
      const end = new Date(item.charge_end_time ?? "");
      const durationMinutes = Math.floor(
        (end.getTime() - start.getTime()) / 60000
      );
      return {
        id: `${index}`,
        date: item.charge_end_time ?? "",
        durationMinutes,
      };
    });
  }, [selectedBattery]);

  // Apply filter
  const filteredData = useMemo(() => {
    const filter = filters.find((f) => f.key === activeFilter);
    if (!filter || filter.daysAgo === null) return historyData;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filter.daysAgo);

    return historyData.filter((item) => {
      const itemDate = new Date(item.date);
      return !isNaN(itemDate.getTime()) && itemDate >= cutoff;
    });
  }, [activeFilter, historyData]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const dateObj = new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const hours = Math.floor(item.durationMinutes / 60);
    const minutes = item.durationMinutes % 60;
    const durationLabel =
      hours > 0
        ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`
        : `${minutes}m`;

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-4 mb-3 flex-row justify-between items-center shadow"
        onPress={() => {
          router.push({
            pathname: "/charging-details",
            params: { sessionIndex: index.toString() },
          });
        }}
      >
        <View className="flex-1">
          <Text className="text-lg font-medium">Charging Session</Text>
          <View className="flex-row mt-1 items-center">
            <Text className="text-gray-500">{formattedDate}</Text>
            <Text className="text-gray-500 ml-4">{durationLabel}</Text>
          </View>
        </View>
        <Icon name="chevron-forward" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header insets={insets} text="Charging History" />

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, alignItems: "center" }}
        style={{ flexGrow: 0 }}
        className="mt-2 mb-2 px-2"
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            className={`px-4 py-2 rounded-full mr-3 ${
              activeFilter === filter.key ? "bg-orange-500" : "bg-gray-200"
            }`}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              className={`${
                activeFilter === filter.key ? "text-white" : "text-gray-700"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No sessions found for selected filter.
          </Text>
        }
      />
    </View>
  );
}
