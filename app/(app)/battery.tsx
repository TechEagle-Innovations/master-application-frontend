import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FullBatteryIcon from '@/assets/images/full-battery.svg';
import LowBatteryIcon from '@/assets/images/low-battery.svg';
import LowBatteryIcon2 from '@/assets/images/low-battery2.svg';

import Header from '@/components/Header';
import { Battery, batteryService } from '@/utils/api/services/BatteryService';

const TABS = [
    { label: 'Available', value: 'available' },
    { label: 'Discarded', value: 'discarded' },
];

const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Charged', value: 'charged' },
    { label: 'Discharged', value: 'discharged' },
];

function getBatteryStatus(percent: number) {
    if (percent >= 60) return 'charged';
    if (percent <= 20) return 'discharged';
    return 'medium';
}

function getBatteryIcon(percent: number) {
    if (percent >= 60) return <FullBatteryIcon width={28} height={28} />;
    if (percent <= 20) return <LowBatteryIcon width={28} height={28} />;
    return <LowBatteryIcon2 width={28} height={28} />;
}

export default function BatteryScreen() {
    const insets = useSafeAreaInsets();

    const [batteries, setBatteries] = useState<Battery[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'available' | 'discarded'>('available');
    const [activeFilter, setActiveFilter] = useState<'all' | 'charged' | 'discharged'>('all');

    const fetchBatteries = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await batteryService.getBatteries();
            console.log(res);
            setBatteries(res as Battery[]);
        } catch (err) {
            console.error('Failed to fetch batteries:', err);
            setError('Failed to load batteries. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatteries();
    }, [activeTab]);

    // Filter logic
    const filteredBatteries = batteries?.filter(b => {
        if (activeTab === 'discarded') return false; // For now
        if (activeFilter === 'charged') return b.chargingPercentage >= 60;
        if (activeFilter === 'discharged') return b.chargingPercentage <= 20;
        return true; // "all"
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
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ padding: 12, alignItems: 'center' }}
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
            </ScrollView>

            {/* Battery List */}
            <ScrollView className="flex-1 px-2">
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
                    const status = getBatteryStatus(battery.chargingPercentage);
                    const isDischarged = status === 'discharged';
                    return (
                        <View
                            key={battery._id}
                            className="bg-white rounded-2xl flex-row items-center justify-between px-6 py-6 mb-3 shadow-sm"
                        >
                            <View className="flex-row items-center">
                                {getBatteryIcon(battery.chargingPercentage)}
                                <Text className="ml-3 text-lg" style={{ color: isDischarged ? '#ef4444' : '#222' }}>
                                    {battery.serialNumber}
                                </Text>
                            </View>
                            <Text className="ml-1 text-lg font-semibold" style={{ color: isDischarged ? '#ef4444' : '#22c55e' }}>
                                {battery.chargingPercentage}%
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
