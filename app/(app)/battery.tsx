import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { Battery, batteryService } from '@/utils/api/services/BatteryService';
import BatteryCard from '@/components/BatteryCard';
import { useFocusEffect, useRouter } from 'expo-router';
import { useShipment } from '@/utils/ShipmentContext';

const TABS = [
    { label: 'Available', value: 'available' },
    { label: 'Discarded', value: 'discarded' },
];

const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Charged', value: 'charged' },
    { label: 'Discharged', value: 'discharged' },
    { label: 'Charging', value: 'charging' },
];

// Use a flexible type for batteries to support new backend fields
export type BatteryAPI = {
    _id: string;
    __v?: number;
    battery_id?: string;
    battery_type?: string;
    charged_status?: string;
    createdAt?: string;
    created_by?: string;
    curr_max_vdiff?: number;
    current_voltage?: number;
    cycle_count?: number;
    flight_history?: any[];
    current_flight_id?:string; // You might want to replace 'any' with a more specific type
    history?: {
        cell_voltage?: any; // Replace with proper type if you know the structure
        charge_end_time?: string;
        charge_start_time?: string;
        charging_hours?: number;
        maxVdiff?: number;
        monitor_by?: string;
        remark?: string;
        voltage_after_charge?: number;
        voltage_before_charge?: number;
    }[];
    hubId?: string;
    image?: string;
    locationId?: string;
    mah?: number;
    model?: string;
    num_of_cells?: number;
    updatedAt?: string;
    voltage?: number;
};
export default function BatteryScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [batteries, setBatteries] = useState<BatteryAPI[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'available' | 'discarded'>('available');
    const [activeFilter, setActiveFilter] = useState<'all' | 'charged' | 'discharged' | 'charging'>('all');
    const { setSelectedBattery } = useShipment();
    const fetchBatteries = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await batteryService.getBatteries();
            console.log(res);
            setBatteries(res as BatteryAPI[]);
        } catch (err) {
            console.error('Failed to fetch batteries:', err);
            setError('Failed to load batteries. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBatteries();
        }, [activeTab])
    );

    // Filter logic
    const filteredBatteries = batteries?.filter(b => {
        if (activeTab === 'discarded') return b.charged_status === "discarded"; // For now
        if (activeFilter === 'charged') return b.charged_status === 'charged';
        if (activeFilter === 'discharged') return b.charged_status === 'discharged';
        if (activeFilter === 'charging') return b.charged_status === 'charging';
        return b.charged_status != "discarded"; // "all"
    }) || [];

    return (
        <View className="flex-1 bg-white">
            <Header insets={insets} text="Batteries" />

            {/* Tabs */}
            <View className="flex-row border-b border-gray-200 mt-2">
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.value}
                        className={`flex-1 py-3 ${activeTab === tab.value ? 'border-b-2 border-orange-500' : ''}`}
                        onPress={() => setActiveTab(tab.value as 'available' | 'discarded')}
                    >
                        <Text className={`text-lg text-center ${activeTab === tab.value ? 'text-orange-500' : 'text-gray-400'}`}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Filters */}
            {activeTab === "available" && <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingBottom: 12, // Added bottom padding
                    alignItems: 'center'
                }}
                style={{ flexGrow: 0 }}
                className="mt-2 mb-2 px-2"
            >
                {FILTERS.map((filter, idx) => (
                    <TouchableOpacity
                        key={filter.value}
                        className={`px-5 h-10 flex-row items-center justify-center rounded-full mr-3 ${activeFilter === filter.value ? 'bg-orange-500' : 'bg-gray-100'} ${idx === 0 ? 'shadow-md' : ''}`}
                        style={{ borderWidth: activeFilter === filter.value ? 0 : 1, borderColor: activeFilter === filter.value ? 'transparent' : '#e5e7eb' }}
                        onPress={() => setActiveFilter(filter.value as typeof activeFilter)}
                    >
                        <Text className={`${activeFilter === filter.value ? 'text-white' : 'text-gray-700'} font-semibold text-base`}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>}

            {/* Battery List */}
            <ScrollView className="flex-1 px-2"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 30, // 80 accounts for floating button
                    paddingTop: 8 // Small top padding
                }}>
                {loading && (
                    <View className="items-center justify-center mt-6">
                        <ActivityIndicator size="large" color="#f97316" />
                        <Text className="mt-2 text-gray-500">Loading batteries...</Text>
                    </View>
                )}

                {error && !loading && (
                    <View className="items-center justify-center mt-6 px-4">
                        <Text className="text-red-500 text-center font-medium">{error}</Text>
                    </View>
                )}

                {!loading && !error && filteredBatteries.length === 0 && (
                    <View className="items-center justify-center mt-6">
                        <Text className="text-gray-400">No batteries found for the selected filter.</Text>
                    </View>
                )}

                {!loading && !error && filteredBatteries.map(battery => {
                    return (
                        <BatteryCard
                            key={battery._id}
                            battery={battery}
                            onPress={() => {
                                setSelectedBattery(battery);
                                router.push({ pathname: '/(app)/battery-info', params: { id: battery._id } })
                            }}
                        />
                    );
                })}
            </ScrollView>
            {/* Floating Add Battery Button */}
            <TouchableOpacity
                className="absolute bottom-8 right-8 bg-orange-500 rounded-full w-16 h-16 items-center justify-center shadow-lg"
                style={{
                    bottom: insets.bottom + 16, // 16px above bottom safe area
                    elevation: 6
                }}
                onPress={() => router.push('/(app)/add-battery')}
                activeOpacity={0.85}
            >
                <Text className="text-white text-3xl">+</Text>
            </TouchableOpacity>
            <View
                style={{
                    height: insets.bottom,
                    backgroundColor: 'white'
                }}
            />
        </View>
    );
}
