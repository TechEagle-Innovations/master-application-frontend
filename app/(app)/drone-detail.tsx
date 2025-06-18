import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DroneImage from '@/assets/images/droneImage.svg';
import { ChevronLeft } from 'lucide-react-native';
import { CalendarDays, PlaneTakeoff, Clock } from 'lucide-react-native';

// Mock data for now
const mockDrone = {
    id: 'A2589',
    model: 'M300-RTK',
    assigned: true,
    totalFlights: 57,
    lastMaintenance: 'Oct 15, 2023',
    flightHistory: [
        {
            date: 'Oct 20, 2023',
            duration: '45 min',
            title: 'Site Survey - Downtown Project',
            location: 'Central Business District',
        },
        {
            date: 'Oct 18, 2023',
            duration: '30 min',
            title: 'Infrastructure Inspection',
            location: 'Central Business District',
        },
        {
            date: 'Oct 18, 2023',
            duration: '30 min',
            title: 'Infrastructure Inspection',
            location: 'Central Business District',
        },
        {
            date: 'Oct 18, 2023',
            duration: '30 min',
            title: 'Infrastructure Inspection',
            location: 'Central Business District',
        },
    ],
};

// Header Component
function DroneDetailHeader({ model, id, onBack, topInset }: { model: string; id: string; onBack: () => void; topInset: number }) {
    return (
        <View
            className="flex-row items-center p-4 border-b border-gray-200"
            style={{ paddingTop: topInset, minHeight: 56 + topInset }}
        >
            <TouchableOpacity onPress={onBack} className="p-2" accessibilityRole="button" accessibilityLabel="Go back">
                <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-lg font-semibold mr-10">
            # {id}
            </Text>
        </View>
    );
}

// Stats Component
function DroneStats({ totalFlights, lastMaintenance }: { totalFlights: number; lastMaintenance: string }) {
    return (
        <View className="flex-row justify-around mb-6 px-2">
            <View className="items-center bg-gray-50 rounded-xl p-4 flex-1 mx-2 shadow-sm ">
                <View className='flex-row gap-4 justify-center items-center'>
                    <PlaneTakeoff size={26} color="#ea580c" />
                    <Text className="text-2xl font-bold text-gray-800 mt-2">{totalFlights}</Text>
                </View>
                <Text className="text-gray-500 mt-1">Total Flights</Text>
            </View>
            <View className="items-center bg-gray-50 rounded-xl p-4 flex-1 mx-2 shadow-sm">
                <View className='flex-row gap-4 justify-center items-center'>
                    <CalendarDays size={22} color="#ea580c" />
                    <Text className="text-lg font-bold text-gray-800 mt-2">{lastMaintenance}</Text>
                </View>
                <Text className="text-gray-500 mt-1">Last Maintenance</Text>
            </View>
        </View>
    );
}

// Flight History Component
function FlightHistory({ history }: { history: { date: string; duration: string; title: string; location: string }[] }) {
    return (
        <View className="px-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Flight History</Text>
            {history.map((flight, idx) => (
                <View key={idx} className="bg-gray-50 rounded-xl p-4 mb-3">
                    <View className="flex-row justify-between items-center mb-1">
                        <View className="flex-row items-center">
                            <Clock size={16} color="#6b7280" />
                            <Text className="ml-2 text-gray-700 font-medium">{flight.date}</Text>
                        </View>
                        <Text className="text-gray-500">{flight.duration}</Text>
                    </View>
                    <Text className="text-gray-800 font-semibold mb-1">{flight.title}</Text>
                    <View className="flex-row items-center">
                        <Text className="text-gray-400 mr-1">&#9679;</Text>
                        <Text className="text-gray-500">{flight.location}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

// Footer Actions Component
function DroneFooterActions({ assigned, bottomInset }: { assigned: boolean; bottomInset: number }) {
    return (
        <View
            className="px-6 bg-white border-t border-gray-200"
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                paddingBottom: bottomInset + 16,
                paddingTop: 16,
                zIndex: 10,
            }}
        >
            {true && (
                <TouchableOpacity className="bg-primary rounded-xl py-4 mb-3 items-center" accessibilityRole="button" accessibilityLabel="Run Pre-Flight Checklist">
                    <Text className="text-white text-lg font-semibold">Run Pre-Flight Checklist</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity className="bg-gray-100 rounded-xl py-4 items-center" accessibilityRole="button" accessibilityLabel="Report an Issue">
                <Text className="text-gray-800 text-lg font-semibold">Report an Issue</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function DroneDetail() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ id?: string; assigned?: string }>();
    // Use params.id and params.assigned to determine which drone and if assigned
    const drone = {
        ...mockDrone,
        id: params.id || mockDrone.id,
        assigned: params.assigned === '1',
    };

    return (
        <View className="flex-1 bg-white">
            <DroneDetailHeader model={drone.model} id={drone.id} onBack={router.back} topInset={insets.top} />
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
                showsVerticalScrollIndicator={false}
            >
                {/* Drone Image */}
                <View className="items-center p-6 mb-4 bg-gray-100 ">
                    <DroneImage width={325} height={246} />
                </View>
                <DroneStats totalFlights={drone.totalFlights} lastMaintenance={drone.lastMaintenance} />
                <FlightHistory history={drone.flightHistory} />
            </ScrollView>
            <DroneFooterActions assigned={drone.assigned} bottomInset={insets.bottom} />
        </View>
    );
} 