import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import FullBatteryIcon from '@/assets/images/full-battery.svg';
import MediumBatteryIcon from '@/assets/images/battery.svg';
import LowBatteryIcon from '@/assets/images/low-battery.svg';
import LowBatteryIcon2 from '@/assets/images/low-battery2.svg';

import { useRouter } from 'expo-router';
import { prefetch } from 'expo-router/build/global-state/routing';
import Header from '@/components/Header';

const TABS = [
    { label: 'Available', value: 'available' },
    { label: 'Discarded', value: 'discarded' },
];
const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Charged', value: 'charged' },
    { label: 'Discharged', value: 'discharged' },
];

const BATTERIES = [
    { id: 'BAT-2024-001', percent: 82 },
    { id: 'BAT-2024-002', percent: 75 },
    { id: 'BAT-2024-003', percent: 90 },
    { id: 'BAT-2024-004', percent: 65 },
    { id: 'BAT-2024-002', percent: 12 },
    { id: 'BAT-2024-003', percent: 14 },
    { id: 'BAT-2024-004', percent: 10 },  { id: 'BAT-2024-004', percent: 50 },
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
  
    const [activeTab, setActiveTab] = useState('available');
    const [activeFilter, setActiveFilter] = useState('all');

    // Filter logic
    let filteredBatteries = BATTERIES.filter(b => {
        if (activeTab === 'discarded') return false; // No discarded in static data
        if (activeFilter === 'all') return true;
        if (activeFilter === 'charged') return b.percent >= 60;
        if (activeFilter === 'discharged') return b.percent <= 20;
        return true;
    });

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <Header insets={insets} text={"Batteries"} />
            {/* Tabs */}
            <View className="flex-row border-b border-gray-200 mt-2">
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.value}
                        className={`flex-1 py-3 ${activeTab === tab.value ? 'border-b-2 border-orange-500' : ''}`}
                        onPress={() => setActiveTab(tab.value)}
                    >
                        <Text className={`text-lg text-center ${activeTab === tab.value ? 'text-orange-500' : 'text-gray-400'}`}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    padding: 12,   // mb-0
                    alignItems: 'center',  // Vertically center items
                }}
                style={{
                    flexGrow: 0,          // Prevents taking extra vertical space
                }}
                className="mt-2 mb-2 px-2">
                {FILTERS.map((filter, idx) => (
                    <TouchableOpacity
                        key={filter.value}
                        className={`px-5 h-10 flex-row items-center justify-center rounded-full mr-3 ${activeFilter === filter.value ? 'bg-orange-500' : 'bg-gray-100'} ${idx === 0 ? 'shadow-md' : ''}`}
                        style={{ borderWidth: activeFilter === filter.value ? 0 : 1, borderColor: activeFilter === filter.value ? 'transparent' : '#e5e7eb' }}
                        onPress={() => setActiveFilter(filter.value)}
                    >
                        <Text className={`${activeFilter === filter.value ? 'text-white' : 'text-gray-700'} font-semibold text-base`}>{filter.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {/* Battery List */}
            <ScrollView className="flex-1 px-2">
                {filteredBatteries.map(battery => {
                    const status = getBatteryStatus(battery.percent);
                    const isDischarged = status === 'discharged';
                    return (
                        <View key={battery.id + battery.percent} className="bg-white rounded-2xl flex-row items-center justify-between px-6 py-6 mb-3 shadow-sm">
                            <View className="flex-row items-center" >
                                {getBatteryIcon(battery.percent)}
                                <Text className="ml-3 text-lg" style={{ color: isDischarged ? '#ef4444' : '#222' }}>{battery.id}</Text>
                            </View>
                            <Text className="ml-1 text-lg font-semibold" style={{ color: isDischarged ? '#ef4444' : '#22c55e' }}>{battery.percent}%</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
} 