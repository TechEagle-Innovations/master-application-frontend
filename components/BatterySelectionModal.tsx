import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { batteryService, ConnectBatteryData, type Battery } from '@/utils/api/services/BatteryService';
import { useShipment } from '@/utils/ShipmentContext';

interface BatterySelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (selectedBatteries: Battery[]) => void;
    maxBatteries?: number;
}

const BatterySelectionModal: React.FC<BatterySelectionModalProps> = ({
    visible,
    onClose,
    onConfirm,
    maxBatteries = 4
}) => {
    const [selectedBatteries, setSelectedBatteries] = useState<Battery[]>([]);
    const { selectedFlight } = useShipment();
    const [batteries, setBatteries] = useState<Battery[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);

    // Reset when modal opens
    useEffect(() => {
        if (visible) {
            setSelectedBatteries([]);
            setConnecting(false);
        }
    }, [visible]);

    // Fetch batteries
    useEffect(() => {
        const getBatteries = async () => {
            if (!visible) return;

            setLoading(true);
            try {
                let batteryData: any = await batteryService.getBatteries() as Battery[];

                // Filter out discarded batteries
                batteryData = batteryData.filter((b: Battery) => b.charged_status !== "discarded");

                // Validate battery data
                if (!Array.isArray(batteryData)) {
                    throw new Error('Invalid battery data received');
                }

                setBatteries(batteryData);
            } catch (error) {
                console.log("Error fetching batteries:", error);
                Alert.alert('Error', 'Failed to load batteries. Please try again.');
                setBatteries([]);
            } finally {
                setLoading(false);
            }
        };

        getBatteries();
    }, [visible]);

    const handleConfirm = async () => {
        if (selectedBatteries.length === 0) {
            Alert.alert('No Selection', 'Please select at least one battery');
            return;
        }

        if (connecting) return; // Prevent multiple calls

        setConnecting(true);
        try {
            if (!selectedFlight) {
                Alert.alert('Error', 'Flight information not available');
                return;
            }

            if (!selectedFlight._id || !selectedFlight.drone_id) {
                Alert.alert('Error', 'Invalid flight information');
                return;
            }
            console.log("selectedBatteries", selectedBatteries);
            const data: ConnectBatteryData = {
                all_battery: selectedBatteries.map(b => b.battery_id),
                flightId: selectedFlight._id,
                droneId: selectedFlight.drone_id
            };

           const batteryData: any= await batteryService.connectBattery(data);
           console.log("batteryData", batteryData);
            console.log('Batteries connected successfully');
            onConfirm(selectedBatteries);
        } catch (error) {
            console.log("Error connecting batteries:", error);
            Alert.alert('Connection Failed', 'Failed to connect batteries. Please try again.');
        } finally {
            setConnecting(false);
        }
    };

    const availableBatteries = batteries?.filter(battery =>
        battery.charged_status === 'charged' &&
        !battery.current_flight_id
    ) || [];

    // Convert batteries to dropdown format
    const dropdownData = availableBatteries.map(battery => ({
        label: `${battery.battery_id} (${battery.voltage}V)`,
        value: battery._id,
        battery: battery
    }));

    const handleSelectionChange = (selectedIds: string[]) => {
        // Validate input
        if (!Array.isArray(selectedIds)) {
            console.log('Invalid selection data received');
            return;
        }

        // Check max limit
        if (selectedIds.length > maxBatteries) {
            Alert.alert('Maximum Reached', `You can only select up to ${maxBatteries} batteries`);
            return;
        }

        // Filter and validate selected batteries
        const selectedBats = availableBatteries.filter(battery =>
            selectedIds.includes(battery._id) && battery._id
        );

        setSelectedBatteries(selectedBats);
    };

    const selectedIds = selectedBatteries.map(b => b._id).filter(Boolean);

    const handleClose = () => {
        if (connecting) {
            Alert.alert('Connection in Progress', 'Please wait for the connection to complete.');
            return;
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/30 justify-center items-center px-4">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md">
                    {/* Header */}
                    <View className="flex-col justify-between items-center mb-2">
                        <Text className="text-xl text-gray-800">Select Batteries</Text>
                        {/* <TouchableOpacity 
                            onPress={handleClose} 
                            className="p-1"
                            disabled={connecting}
                        >
                            <X size={24} color={connecting ? "#9CA3AF" : "#6B7280"} />
                        </TouchableOpacity> */}
                    </View>

                    {/* Instructions */}
                    <Text className="text-gray-500 mb-4 text-center">
                        Select Batteries connect to Drone
                    </Text>

                    {/* Multiselect Dropdown */}
                    <View className="mb-4">
                        {/* <Text className="font-semibold text-gray-800 mb-4">
                            Available Batteries
                        </Text> */}

                        {loading ? (
                            <View className="bg-gray-50 rounded-lg p-4 items-center">
                                <ActivityIndicator size="small" color="#6B7280" />
                                <Text className="text-gray-500 mt-2">Loading batteries...</Text>
                            </View>
                        ) : availableBatteries.length === 0 ? (
                            <View className="bg-gray-50 rounded-lg p-4 items-center">
                                <Text className="text-gray-500 text-center">No available batteries found</Text>
                            </View>
                        ) : (
                            <MultiSelect
                                data={dropdownData}
                                labelField="label"
                                valueField="value"
                                placeholder="Select batteries..."
                                value={selectedIds}
                                onChange={handleSelectionChange}

                                selectedStyle={{
                                    backgroundColor: '#fef3c7',
                                    borderRadius: 10,

                                }}
                                containerStyle={{
                                    backgroundColor: '#f9fafb',
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: '#d1d5db',
                                    minHeight: 40,
                                }}
                                itemContainerStyle={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: 8,
                                    marginVertical: 2,
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                }}
                                itemTextStyle={{
                                    color: '#374151',
                                    fontSize: 14,
                                }}
                                selectedTextStyle={{
                                    color: '#92400e',
                                    fontWeight: '600',
                                }}
                                maxSelect={maxBatteries}
                                disable={connecting}
                            />
                        )}
                    </View>

                    {/* Selected Count */}
                    {/* {selectedBatteries.length > 0 && (
                        <View className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Text className="font-medium text-gray-800 text-center">
                                {selectedBatteries.length} battery{selectedBatteries.length > 1 ? 'ies' : 'y'} selected
                            </Text>
                        </View>
                    )} */}

                    {/* Action Buttons */}
                    <View className="flex-row justify-between gap-4">
                        <TouchableOpacity
                            className={`rounded-xl py-3 px-6 flex-1 items-center ${connecting ? 'bg-gray-100' : 'bg-gray-200'
                                }`}
                            onPress={handleClose}
                            disabled={connecting}
                        >
                            <Text className={`text-lg font-semibold ${connecting ? 'text-gray-400' : 'text-gray-700'
                                }`}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`rounded-xl py-3 px-6 flex-1 items-center ${selectedBatteries.length === 0 || connecting
                                    ? 'bg-gray-300'
                                    : 'bg-orange-500'
                                }`}
                            onPress={handleConfirm}
                            disabled={selectedBatteries.length === 0 || connecting}
                        >
                            {connecting ? (
                                <View className="flex-row items-center">
                                    <ActivityIndicator size="small" color="#ffffff" />
                                    <Text className="text-white text-lg font-semibold ml-2">Connecting...</Text>
                                </View>
                            ) : (
                                <Text className="text-white text-lg font-semibold">Connect</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default BatterySelectionModal; 