import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DroneImage from '@/assets/images/droneImage.svg';
import { ChevronLeft } from 'lucide-react-native';
import { CalendarDays, PlaneTakeoff, Clock } from 'lucide-react-native';
import { flightService, FlightHistoryItem } from '@/utils/api/services/FlightService';
import Header from '@/components/Header';

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

// Footer Actions Component
function DroneFooterActions({ assigned, bottomInset, droneId }: { assigned: boolean; bottomInset: number; droneId: string }) {
    const router = useRouter();
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
            <TouchableOpacity 
                className="bg-gray-100 rounded-xl py-4 items-center" 
                accessibilityRole="button" 
                accessibilityLabel="Report an Issue"
                onPress={() => router.push({ pathname: '/(app)/report-issue', params: { id: droneId } })}
            >
                <Text className="text-gray-800 text-lg font-semibold">Report an Issue</Text>
            </TouchableOpacity>
        </View>
    );
}

function useFlightHistory(droneId?: string) {
    const [flightHistory, setFlightHistory] = useState<FlightHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!droneId) return;
        setLoading(true);
        setError(null);
        flightService.getFlightHistory(droneId)
            .then(setFlightHistory)
            .catch((err: any) => setError(err.message || 'Failed to fetch flight history'))
            .finally(() => setLoading(false));
    }, [droneId]);

    return { flightHistory, loading, error };
}

export default function DroneDetail() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ id?: string; assigned?: string }>();
    const drone = {
        ...mockDrone,
        id: params.id || mockDrone.id,
        assigned: params.assigned === '1',
    };
    const { flightHistory, loading, error } = useFlightHistory(drone.id);

    return (
        <View className="flex-1 bg-white">
         
            <Header insets={insets} text={`# ${drone.id}`} />
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
                showsVerticalScrollIndicator={false}
            >
                {/* Drone Image */}
                <View className="items-center p-6 mb-4 bg-gray-100 ">
                    <DroneImage width={325} height={246} />
                </View>
                <DroneStats totalFlights={flightHistory.length} lastMaintenance={drone.lastMaintenance} />
                <View className="px-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-3">Flight History</Text>
                  {loading && <Text>Loading...</Text>}
                  {error && <Text className="text-red-500">{error}</Text>}
                  {!loading && !error && flightHistory.length === 0 && (
                    <Text className="text-gray-500">No flight history found.</Text>
                  )}
                  {!loading && !error && flightHistory.map((flight, idx) => (
                    <View key={flight._id || idx} className="bg-gray-50 rounded-xl p-4 mb-3">
                      <View className="flex-row justify-between items-center mb-1">
                        <View className="flex-row items-center">
                          <Clock size={16} color="#6b7280" />
                          <Text className="ml-2 text-gray-700 font-medium">{new Date(flight.date_created).toLocaleDateString()}</Text>
                        </View>
                        <Text className="text-gray-500">{flight.time_taken ? `${flight.time_taken} min` : '-'}</Text>
                      </View>
                      <Text className="text-gray-800 font-semibold mb-1">{flight.flight_type || flight.localFlightId}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-gray-400 mr-1">&#9679;</Text>
                        <Text className="text-gray-500">{flight.order_destination_location || '-'}</Text>
                      </View>
                    </View>
                  ))}
                </View>
            </ScrollView>
            <DroneFooterActions assigned={drone.assigned} bottomInset={insets.bottom} droneId={drone.id} />
        </View>
    );
} 