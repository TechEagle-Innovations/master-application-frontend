import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { useShipment } from '@/utils/ShipmentContext'
import Header from '@/components/Header'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@/utils/auth/AuthContext'
import { CLEARSKY_URL, locationIdToNameMap } from '@/utils/api/config'
import ConnectDroneModal from '@/components/connnect-drone-modal'
import BatterySelectionModal from '@/components/BatterySelectionModal'
import { flightService } from '@/utils/api/services/FlightService'
import type { Battery } from '@/utils/api/services/BatteryService'

const FlightDetails = () => {
    const {
        selectedFlight = null,
        parcelvalidate = false,
        connected = false,
        setConnected = () => {},
        isBatterConnected = false,
        setIsBatteryConnected = () => {},
    } = useShipment() || {}; // Provide empty fallback object
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { flightId, tab } = useLocalSearchParams();
    const { user, setClearskToken } = useAuth();
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showBatteryModal, setShowBatteryModal] = useState(false);
    const [password, setPassword] = useState('');
    const [connectLoading, setConnectLoading] = useState(false);
    const [connectError, setConnectError] = useState(''); 
    const [selectedBatteries, setSelectedBatteries] = useState<Battery[]>([]);
    const {clearskyToken}=useAuth();
    // const [pageLoading, setPageLoading] = useState(false);

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

            if (!selectedFlight?.drone_id) {
                throw new Error("Drone ID is missing.");
            }
            console.log({
                email: user.email,
                droneId: selectedFlight?.drone_id,
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
            const response: any = await flightService.connectDrone(selectedFlight?.drone_id);


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

    const handleBatterySelection = async (selectedBatteries: Battery[]) => {
        try {
            console.log('Selected batteries:', selectedBatteries);

            setSelectedBatteries(selectedBatteries);
            setIsBatteryConnected(true);
            setShowBatteryModal(false);

        } catch (error) {
            console.error('Battery connection error:', error);
            Alert.alert('Error', 'Failed to connect batteries. Please try again.');
        }
    };



    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Enhanced flight data with better fallbacks and real data integration
    const flightData = {
        flightId: selectedFlight?.localFlightId || flightId || "FLT-1122",
        pickupLocation: {
            address: locationIdToNameMap[selectedFlight?.start_location as keyof typeof locationIdToNameMap] ||
                selectedFlight?.start_location ||
                "123 Innovation Park, Silicon Valley",
            date: selectedFlight?.date_created ? formatDate(selectedFlight.date_created) : "Sept 15, 2023",
            time: selectedFlight?.date_created ? formatTime(selectedFlight.date_created) : "10:30 AM"
        },
        deliveryLocation: {
            address: locationIdToNameMap[selectedFlight?.order_destination_location as keyof typeof locationIdToNameMap] ||
                selectedFlight?.order_destination_location ||
                "456 Tech Avenue, Mountain View",
            date: selectedFlight?.date_created ? formatDate(selectedFlight.date_created) : "Sept 15, 2023",
            time: selectedFlight?.date_created ? formatTime(selectedFlight.date_created) : "11:15 AM"
        },
        shipmentOverview: {
            totalPackages: selectedFlight?.payload ? Math.ceil(selectedFlight.payload / 2.5) : 3, // Estimate based on payload
            totalWeight: selectedFlight?.payload ? `${selectedFlight.payload}KG` : "3.5KG"
        },
        parcels: [
            {
                id: "PKG001",
                weight: "2.5 kg",
                type: "Electronics"
            },
            {
                id: "PKG002",
                weight: "2.5 kg",
                type: "Healthcare"
            },
            {
                id: "PKG003",
                weight: "2.5 kg",
                type: "Electronics"
            }
        ]
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            {/* <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
                <TouchableOpacity onPress={router.back} className="p-2">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-semibold text-gray-800 mr-10">
                    {flightData.flightId}
                </Text>
            </View> */}
            <Header insets={insets} text={selectedFlight?.localFlightId} />
            {/* Battery Connection Status */}
            {selectedBatteries.length > 0 && (
                <View className="bg-green-50 border-l-4 border-green-400 p-3 mx-4 mt-2 rounded-r-lg">
                    <Text className="text-green-800 font-medium">
                        {String.fromCharCode(10003)} {selectedBatteries.length} battery{selectedBatteries.length !== 1 ? 'ies' : 'y'} connected
                    </Text>
                </View>
            )}
            <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 180 // Increased padding to account for footer height
                }}>
                {/* Location Details Card */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    {/* Pickup Location */}
                    <View className="mb-4">
                        <View className="flex-row items-start mb-2">
                            <View className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-3" />
                            <View className="flex-1">
                                <Text className="text-sm text-gray-500 mb-1">Pickup Location</Text>
                                <Text className="text-base font-semibold text-gray-800 mb-1">
                                    {locationIdToNameMap[selectedFlight?.start_location as keyof typeof locationIdToNameMap] || flightData.pickupLocation.address}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    {selectedFlight?.date_created ?
                                        `${formatDate(selectedFlight.date_created)} • ${formatTime(selectedFlight.date_created)}` :
                                        `${flightData.pickupLocation.date} • ${flightData.pickupLocation.time}`
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Delivery Location */}
                    <View>
                        <View className="flex-row items-start">
                            <View className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3" />
                            <View className="flex-1">
                                <Text className="text-sm text-gray-500 mb-1">Delivery Location</Text>
                                <Text className="text-base font-semibold text-gray-800 mb-1">
                                    {locationIdToNameMap[selectedFlight?.order_destination_location as keyof typeof locationIdToNameMap] || flightData.deliveryLocation.address}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                    {selectedFlight?.date_created ?
                                        `${formatDate(selectedFlight.date_created)} • ${formatTime(selectedFlight.date_created)}` :
                                        `${flightData.deliveryLocation.date} • ${flightData.deliveryLocation.time}`
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Shipment Overview Card */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Shipment Overview</Text>
                    <View className="space-y-2">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Total Packages:</Text>
                            <Text className="font-semibold text-gray-800">{flightData.shipmentOverview.totalPackages}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Total Weight:</Text>
                            <Text className="font-semibold text-gray-800">{flightData.shipmentOverview.totalWeight}</Text>
                        </View>
                        {selectedFlight?.payload && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Payload:</Text>
                                <Text className="font-semibold text-gray-800">{selectedFlight.payload} kg</Text>
                            </View>
                        )}
                        {selectedFlight?.time_taken && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Flight Duration:</Text>
                                <Text className="font-semibold text-gray-800">{selectedFlight.time_taken} min</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Parcel Details Card */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-3">Parcel Details</Text>
                    {flightData.parcels.map((parcel, index) => (
                        <View key={parcel.id} className={`py-3 ${index !== flightData.parcels.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <View className="flex-row justify-between items-start mb-1">
                                <Text className="font-semibold text-gray-800">Package {index + 1}</Text>
                                <Text className="text-sm text-gray-500">#{parcel.id}</Text>
                            </View>
                            <Text className="text-sm text-gray-600">{parcel.weight} • {parcel.type}</Text>
                        </View>
                    ))}
                </View>

                {/* Flight Status Card */}
                {selectedFlight && (
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">Flight Status</Text>
                        <View className="space-y-2">
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Flight Type:</Text>
                                <Text className="font-semibold text-gray-800">{selectedFlight.flight_type}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Order Type:</Text>
                                <Text className="font-semibold text-gray-800">{selectedFlight.order_type}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Status:</Text>
                                <Text className={`font-semibold ${selectedFlight.isCompleted ? 'text-green-600' : selectedFlight.isAborted ? 'text-red-600' : 'text-orange-600'}`}>
                                    {selectedFlight.isCompleted ? 'Completed' : selectedFlight.isAborted ? 'Aborted' : 'In Progress'}
                                </Text>
                            </View>
                            {selectedFlight.mission_details && (
                                <>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600">Max Altitude:</Text>
                                        <Text className="font-semibold text-gray-800">
                                            {selectedFlight.mission_details.maxAMSL ? `${selectedFlight.mission_details.maxAMSL}m` : 'N/A'}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600">Road Distance:</Text>
                                        <Text className="font-semibold text-gray-800">
                                            {selectedFlight.mission_details.roadDistance ? `${selectedFlight.mission_details.roadDistance}km` : 'N/A'}
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
            <View
                className="absolute left-0 right-0 bottom-0 bg-white px-5 pb-5"
                style={{
                    paddingBottom: insets.bottom + 16, // Add safe area padding
                    elevation: 5 // Add shadow for better visual separation
                }}
            >
                <View className="flex flex-col space-y-3">
                    {/* {<TouchableOpacity
                        className="w-full rounded-xl py-4 bg-gray-100 items-center"
                        onPress={() => {
                            // TODO: discard logic
                        }}
                    >
                        <Text className="text-lg text-black">Discard</Text>
                    </TouchableOpacity>} */}

                    {tab === 'ongoing' && selectedFlight?.isPreFlightChecklistCompleted && !selectedFlight?.isCompleted && connected && (
                        <TouchableOpacity
                            className="w-full rounded-xl py-4 bg-orange-500 items-center"
                            onPress={() =>
                                router.push({
                                    pathname: '/(app)/drone-tracking',
                                    params: {
                                        flightId: selectedFlight?._id,
                                        localFlightId: selectedFlight?.localFlightId,
                                        droneId: selectedFlight?.drone_id,
                                        from: selectedFlight?.start_location,
                                        to: selectedFlight?.end_location,
                                        eta: selectedFlight?.time_taken,
                                        tab: 'ongoing'
                                    }
                                })
                            }
                        >
                            <Text className="text-lg text-white">Track Flight</Text>
                        </TouchableOpacity>
                    )}
                    {tab === 'ongoing' && selectedFlight?.isCompleted && connected &&(
                        <TouchableOpacity
                            className="w-full rounded-xl py-4 bg-orange-500 items-center"
                            onPress={() => router.push('/(app)/postflight-checklist')}
                        >
                            <Text className="text-lg text-white">Run PostFlight Checklist</Text>
                        </TouchableOpacity>
                    )}
                    {(tab === 'ongoing' && !connected ) &&
                        (
                            <TouchableOpacity
                                className="bg-primary rounded-xl py-4 mb-3 items-center"
                                onPress={() => setShowConnectModal(true)}
                                disabled={connectLoading}
                            >
                                <Text className="text-white text-lg font-semibold">Connect</Text>
                            </TouchableOpacity>
                        )
                    }

                    {(tab === 'scheduled' && !parcelvalidate && !(selectedFlight?.end_location === user?.location) && !selectedFlight?.isPreFlightChecklistCompleted && !selectedFlight?.isCompleted && !selectedFlight?.isAborted && !selectedFlight?.isPostFlightChecklistCompleted) && (
                        <TouchableOpacity
                            className="w-full rounded-xl py-4 bg-orange-500 items-center"
                            onPress={() =>
                                router.push('/(app)/pre-parcel-validation')
                            }
                        >
                            <Text className="text-lg text-white">Validate</Text>
                        </TouchableOpacity>
                    )}
                    {(tab === 'scheduled' && parcelvalidate && !connected && !(selectedFlight?.end_location === user?.location) && !selectedFlight?.isPreFlightChecklistCompleted && !selectedFlight?.isCompleted && !selectedFlight?.isAborted && !selectedFlight?.isPostFlightChecklistCompleted) &&
                        (
                            <TouchableOpacity
                                className="bg-primary rounded-xl py-4 mb-3 items-center"
                                onPress={() => setShowConnectModal(true)}
                                disabled={connectLoading}
                            >
                                <Text className="text-white text-lg font-semibold">Connect</Text>
                            </TouchableOpacity>
                        )
                    }
                    {(tab === 'scheduled' && parcelvalidate && connected && !isBatterConnected && !(selectedFlight?.end_location === user?.location) && !selectedFlight?.isPreFlightChecklistCompleted && !selectedFlight?.isCompleted && !selectedFlight?.isAborted && !selectedFlight?.isPostFlightChecklistCompleted) &&
                        (
                            <TouchableOpacity
                                className="bg-primary rounded-xl py-4 mb-3 items-center"
                                onPress={() => setShowBatteryModal(true)}
                                disabled={connectLoading}
                            >
                                <Text className="text-white text-lg font-semibold">Battery Connect</Text>
                            </TouchableOpacity>
                        )
                    }
                    {(tab === 'scheduled' && parcelvalidate && connected && isBatterConnected && !(selectedFlight?.end_location === user?.location) && !selectedFlight?.isPreFlightChecklistCompleted && !selectedFlight?.isCompleted && !selectedFlight?.isAborted && !selectedFlight?.isPostFlightChecklistCompleted) &&
                        (
                            <TouchableOpacity
                                className="bg-primary rounded-xl py-4 mb-3 items-center"
                                onPress={() => router.push({
                                    pathname: '/(app)/preflight-checklist',
                                    params: { id: selectedFlight?.drone_id }
                                })}
                                disabled={connectLoading}
                            >
                                <Text className="text-white text-lg font-semibold">Run Preflight Checklist</Text>
                            </TouchableOpacity>
                        )
                    }

                </View>
            </View>
            <ConnectDroneModal
                showConnectModal={showConnectModal}
                setShowConnectModal={setShowConnectModal}
                password={password}
                setPassword={setPassword}
                connectError={connectError}
                connectLoading={connectLoading}
                handleConnect={handleConnect}
            />
            <BatterySelectionModal
                visible={showBatteryModal}
                onClose={() => setShowBatteryModal(false)}
                onConfirm={handleBatterySelection}
                maxBatteries={4} // You can make this dynamic based on drone type
            />
        </View>
    )
}

export default FlightDetails