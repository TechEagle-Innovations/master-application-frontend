import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DroneImage from '@/assets/images/droneImage.svg';
import { CalendarDays, PlaneTakeoff, Clock } from 'lucide-react-native';
import { flightService, Flight } from '@/utils/api/services/FlightService';
import Header from '@/components/Header';
import { useAuth } from '@/utils/auth/AuthContext';
import { CLEARSKY_URL } from '@/utils/api/config';

interface Drone {
    id: string;
    model: string;
    assigned: boolean;
    totalFlights: number;
    lastMaintenance: string;
}

// Mock data with type safety
const mockDrone: Drone = {
    id: 'A2589',
    model: 'M300-RTK',
    assigned: true,
    totalFlights: 57,
    lastMaintenance: 'Oct 15, 2023',
};

function DroneStats({ totalFlights, lastMaintenance, handleMaintainanceClick }: { totalFlights: number; lastMaintenance: string, handleMaintainanceClick:()=>void }) {
    return (
        <View className="flex-row justify-around mb-6 px-2">
            <View className="items-center bg-gray-50 rounded-xl p-4 flex-1 mx-2 shadow-sm">
                <View className='flex-row gap-4 justify-center items-center'>
                    <PlaneTakeoff size={26} color="#ea580c" />
                    <Text className="text-2xl font-bold text-gray-800 mt-2">{totalFlights}</Text>
                </View>
                <Text className="text-gray-500 mt-1">Total Flights</Text>
            </View>
            <TouchableOpacity className="items-center bg-gray-50 rounded-xl p-4 flex-1 mx-2 shadow-sm"
             onPress={()=>handleMaintainanceClick()}
            >
                <View className='flex-row gap-4 justify-center items-center'>
                    <CalendarDays size={22} color="#ea580c" />
                    <Text className="text-lg font-bold text-gray-800 mt-2">{lastMaintenance}</Text>
                </View>
                <Text className="text-gray-500 mt-1">Last Maintenance</Text>
            </TouchableOpacity>
        </View>
    );
}

function DroneFooterActions({ assigned, bottomInset, droneId, router }: { assigned: boolean; bottomInset: number; droneId: string, router: Router }) {

    const [connected, setConnected] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [password, setPassword] = useState('');
    const [connectLoading, setConnectLoading] = useState(false);
    const [connectError, setConnectError] = useState('');
    const { user, setClearskToken } = useAuth();

    const handleConnect = async () => {
        setConnectLoading(true);
        setConnectError('');

        try {
            // Validate inputs
            if (!user?.email) {
                throw new Error("User authentication required. Please log in again.");
            }

            if (!password.trim()) {
                throw new Error("Password is required.");
            }

            if (!droneId) {
                throw new Error("Drone ID is missing.");
            }
            console.log({
                email: user.email,
                droneId,
                password: password.trim(),
            })
            const responseclr = await fetch(`${CLEARSKY_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    useremail: user.email,
                    password,
                }),
            });

            // Check if response is OK (status 200-299)
            if (!responseclr.ok) {
                const errorData = await responseclr.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data: any = await responseclr.json();
            console.log('Login response:', data);
            setClearskToken(data.token);
            const response: any = await flightService.connectDrone(droneId);


            if (!response || response.status !== 'success') {
                throw new Error(response?.message || "Connection failed. Please try again.");
            }

            setConnected(true);
            setShowConnectModal(false);
            setPassword('');
        } catch (error: any) {
            console.error("Connection error:", error);
            const errorMessage = error.response?.data?.message ||
                error.message ||
                "An unexpected error occurred. Please try again.";
            setConnectError(errorMessage);
        } finally {
            setConnectLoading(false);
        }
    };


    return (
        <View className="px-6 bg-white border-t border-gray-200" style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: bottomInset + 16,
            paddingTop: 16,
            zIndex: 10,
        }}>
            <Modal
                visible={showConnectModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConnectModal(false)}
            >
                <View className="flex-1 bg-black/30 justify-center items-center">
                    <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
                        <Text className="text-xl font-semibold mb-2 text-center">Enter Password</Text>
                        <Text className="text-gray-500 mb-4 text-center">Please enter ClearSky password to continue</Text>
                        <TextInput
                            className="border border-gray-300 rounded-xl px-4 py-3 mb-2 text-base"
                            placeholder="Enter your password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {connectError ? <Text className="text-red-500 text-center mb-2">{connectError}</Text> : null}
                        <View className="flex-row justify-between mt-2">
                            <TouchableOpacity
                                className="bg-gray-200 rounded-xl py-3 px-6 flex-1 mr-2 items-center"
                                onPress={() => setShowConnectModal(false)}
                                disabled={connectLoading}
                            >
                                <Text className="text-gray-700 text-lg font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-primary rounded-xl py-3 px-6 flex-1 ml-2 items-center"
                                onPress={handleConnect}
                                disabled={connectLoading || !password.trim()}
                            >
                                {connectLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-semibold">Connect</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* {!connected && assigned ? (
                <TouchableOpacity
                    className="bg-primary rounded-xl py-4 mb-3 items-center"
                    onPress={() => setShowConnectModal(true)}
                    disabled={connectLoading}
                >
                    <Text className="text-white text-lg font-semibold">Connect</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    className="bg-primary rounded-xl py-4 mb-3 items-center"
                    onPress={() => router.push({
                        pathname: '/(app)/preflight-checklist',
                        params: { id: droneId }
                    })}
                >
                    <Text className="text-white text-lg font-semibold">Run Pre-Flight Checklist</Text>
                </TouchableOpacity>
            )} */}

            <TouchableOpacity
                className="bg-gray-100 rounded-xl py-4 items-center"
                onPress={() => router.push({
                    pathname: '/(app)/report-issue',
                    params: { id: droneId }
                })}
            >
                <Text className="text-gray-800 text-lg font-semibold">Report an Issue</Text>
            </TouchableOpacity>
        </View>
    );
}

function useFlightHistory(droneId?: string) {
    const [flightHistory, setFlightHistory] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!droneId) {
            setError("Drone ID is required");
            return;
        }

        const fetchFlightHistory = async () => {
            setLoading(true);
            setError(null);

            try {
                const response: any = await flightService.getFlightHistory(droneId);

                if (!response || !Array.isArray(response.data)) {
                    throw new Error("Invalid flight history data received");
                }

                setFlightHistory(response.data);
            } catch (error: any) {
                console.error("Flight history error:", error);
                setError(error.response?.data?.message || error.message || "Failed to load flight history");
            } finally {
                setLoading(false);
            }
        };

        fetchFlightHistory();
    }, [droneId]);

    return { flightHistory, loading, error };
}

export default function DroneDetail() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ id?: string; assigned?: string }>();
    const { flightHistory, loading, error } = useFlightHistory(params.id);
    const router = useRouter();
    const handleMaintainanceClick = () => {
        router.push({ pathname: "/(app)/maintainance", params: { droneId: params?.id } })
    }
    // Validate and merge params with mock data
    const drone: Drone = {
        ...mockDrone,
        id: params.id || mockDrone.id,
        assigned: params.assigned === '1',
    };

    if (!drone.id) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-red-500 text-lg">Error: Missing drone ID</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Header insets={insets} text={`# ${drone.id}`} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center p-6 mb-4 bg-gray-100">
                    <DroneImage width={325} height={246} />
                </View>

                <DroneStats
                    totalFlights={flightHistory.length}
                    lastMaintenance={drone.lastMaintenance}
                    handleMaintainanceClick={handleMaintainanceClick}
                />

                <View className="px-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Flight History</Text>

                    {loading && (
                        <View className="py-4">
                            <ActivityIndicator size="large" color="#ea580c" />
                        </View>
                    )}

                    {error && (
                        <View className="bg-red-50 p-4 rounded-xl mb-4">
                            <Text className="text-red-500 text-center">{error}</Text>
                            <TouchableOpacity
                                className="mt-2 bg-red-100 py-2 rounded-lg"
                                onPress={() => useFlightHistory(drone.id)}
                            >
                                <Text className="text-red-600 text-center">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!loading && !error && flightHistory.length === 0 && (
                        <View className="bg-gray-50 p-4 rounded-xl">
                            <Text className="text-gray-500 text-center">No flight history found</Text>
                        </View>
                    )}

                    {!loading && !error && flightHistory.map((flight) => (
                        <View key={flight._id} className="bg-gray-50 rounded-xl p-4 mb-3">
                            <View className="flex-row justify-between items-center mb-1">
                                <View className="flex-row items-center">
                                    <Clock size={16} color="#6b7280" />
                                    <Text className="ml-2 text-gray-700 font-medium">
                                        {flight.date_created ? new Date(flight.date_created).toLocaleDateString() : 'Date not available'}
                                    </Text>
                                </View>
                                <Text className="text-gray-500">
                                    {flight.time_taken ? `${flight.time_taken} min` : '-'}
                                </Text>
                            </View>
                            <Text className="text-gray-800 font-semibold mb-1">
                                {flight.flight_type || flight.localFlightId || 'Flight'}
                            </Text>
                            <View className="flex-row items-center">
                                <Text className="text-gray-400 mr-1">&#9679;</Text>
                                <Text className="text-gray-500">
                                    {flight.order_destination_location || 'Location not specified'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <DroneFooterActions
                assigned={drone.assigned}
                bottomInset={insets.bottom}
                droneId={drone.id}
                router={router}
            />
        </View>
    );
}