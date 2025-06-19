import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useShipment } from '../../utils/ShipmentContext';

// Static mock data for demonstration

const STATUS_OPTIONS = [
    { label: 'Select Status', value: '' },
    { label: 'In Transit', value: 'in_transit' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Delayed', value: 'delayed' },
];

// function getShipmentById(id?: string) {
//   return SHIPMENT_DATA.find(s => s.id === id) || SHIPMENT_DATA[0];
// }

function ShipmentFooterActions({ isDelivered, bottomInset }: { isDelivered: boolean; bottomInset: number }) {
    const [selectedStatus, setSelectedStatus] = useState('');
    const router = useRouter();
    return (
        <View
            className="px-6 bg-white "
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
            {!isDelivered && (
                <View className="mb-4">
                    <View className="bg-white rounded-2xl border border-gray-300 mb-4">
                        <Picker
                            selectedValue={selectedStatus}
                            onValueChange={setSelectedStatus}
                            style={{ color: selectedStatus ? '#111' : '#888', fontSize: 16 }}
                            accessibilityLabel="Select Status"
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                            ))}
                        </Picker>
                    </View>
                    <TouchableOpacity
                        className="bg-gray-100 rounded-xl py-4 mb-3 items-center"
                        accessibilityRole="button"
                        accessibilityLabel="Update the Status"
                        disabled={!selectedStatus}
                        style={{ opacity: selectedStatus ? 1 : 0.5 }}
                    >
                        <Text className="text-gray-800 text-lg font-semibold">Update the Status</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-orange-500 rounded-xl py-4 items-center"
                        accessibilityRole="button"
                        accessibilityLabel="Deliver"
                        onPress={() => router.push('/(app)/otp-confirmation')}
                    >
                        <Text className="text-white text-lg font-semibold">Deliver</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

export default function ShipmentDetail() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { shipment } = useShipment();

    if (!shipment) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-lg text-gray-500">No shipment selected.</Text>
            </View>
        );
    }

    const isDelivered = shipment.deliveryDetails?.isDone;

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View
                className="flex-row items-center px-4 bg-white"
                style={{ paddingTop: insets.top, minHeight: 56 + insets.top }}
            >
                <TouchableOpacity onPress={router.back} className="p-2" accessibilityRole="button" accessibilityLabel="Go back">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl  mr-10">
                    Shipment #{shipment.assignedAWBNumbers || 'N/A'}
                </Text>
            </View>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 + insets.bottom, paddingHorizontal: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Pickup & Delivery Info */}
                <View className="bg-white rounded-2xl \ p-4 mt-6 mb-4" style={{ elevation: 2 }}>
                    <View className='flex-row gap-6'>
                        <View className="w-3 h-3 rounded-full bg-red-500 mt-1" />
                        <View className="mb-4">

                            <View className="flex-row items-center mb-1">

                                <Text className="text-base text-gray-700">Pickup Location</Text>
                            </View>
                            <Text className="text-lg text-gray-900 mb-1">{shipment.senderDetails?.address?.addressLine}, {shipment.senderDetails?.address?.city}, {shipment.senderDetails?.address?.state}, {shipment.senderDetails?.address?.zipCode}</Text>
                            <Text className="text-gray-400 text-base">{shipment.pickUpDetails?.scheduledDate ? new Date(shipment.pickUpDetails.scheduledDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }) : 'N/A'}</Text>
                        </View>
                    </View>
                    <View className='flex-row gap-6' >
                        <View className="w-3 h-3 rounded-full bg-green-500 mt-1" />
                        <View>

                            <View className="flex-row items-center mb-1">

                                <Text className="text-base text-gray-700">Delivery Location</Text>
                            </View>
                            <Text className="text-lg text-gray-900 mb-1">{shipment.receiverDetails?.address?.addressLine}, {shipment.receiverDetails?.address?.city}, {shipment.receiverDetails?.address?.state}, {shipment.receiverDetails?.address?.zipCode}</Text>
                            <Text className="text-gray-400 text-base">{shipment.deliveryDetails?.scheduledDate ? new Date(shipment.deliveryDetails.scheduledDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }) : 'N/A'}</Text>
                        </View>
                    </View>
                </View>
                {/* Post-Landing Actions */}
                <View className="bg-white rounded-2xl p-4 mb-4" style={{ elevation: 2 }}>
                    <Text className="text-lg mb-4 ">Post-Landing Actions</Text>
                    {isDelivered ? (
                        <View className="flex-row items-center mt-1">
                            <CheckCircle2 size={22} color="#22c55e" className="mr-2" />
                            <Text className="text-base text-green-700 font-medium">Parcel Handed to Deliveryman</Text>
                        </View>
                    ) : (
                        <Text className="text-base text-gray-500">No post-landing actions yet.</Text>
                    )}
                </View>
            </ScrollView>
            {/* Sticky Footer Actions */}
            <ShipmentFooterActions bottomInset={insets.bottom} isDelivered={isDelivered} />
        </View>
    );
} 