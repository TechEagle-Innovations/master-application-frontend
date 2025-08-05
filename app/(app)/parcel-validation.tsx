import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useParcelPhoto } from '../../hooks/useParcelPhoto';
import Header from '@/components/Header';
import { flightService } from '@/utils/api/services/FlightService';
import { useShipment } from '@/utils/ShipmentContext';
import { useAuth } from '@/utils/auth/AuthContext';

export default function ParcelValidation() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { photo, loading, error, takePhoto } = useParcelPhoto();
  const { shipment } = useShipment();
  const { user } = useAuth();

  const handleAddPhoto = async () => {
    await takePhoto();
  };

  const handleValidate = async () => {
    console.log("PHOTO", photo);
    try {
      if (!user || !shipment) {
        return
      }
      const payload = {
        deliveredItemImage: [photo],
        AWB: shipment?.assignedAWBNumbers as string,
        deliveredTime: new Date(), // ISO date string
        pocDetails: {
          pocName: user?.userName,
          phone_no: "1234567890"
        }
      }
      console.log(payload);
      const res: any = await flightService.delivered(payload);
      router.push({ pathname: '/(app)/parcels' });

      console.log("DELERING PARCEL", res.data);
    } catch (error) {
      console.log("ERROR IN DELERING PARCEL", error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Header insets={insets} text={""} />
      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold mb-6">Parcel Validation</Text>
        <Text className="text-lg text-gray-500 mb-12">Click an Image of the Parcel</Text>
        <TouchableOpacity
          className="border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center py-10 mb-8"
          style={{ minHeight: 120 }}
          onPress={handleAddPhoto}
          accessibilityRole="button"
          accessibilityLabel="Add parcel photo"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#94a3b8" />
          ) : photo ? (
            <Image source={{ uri: photo }} style={{ width: 100, height: 100, borderRadius: 12, marginBottom: 8 }} />
          ) : (
            <Camera size={36} color="#94a3b8" />
          )}
          <Text className="text-gray-500 mt-2">{photo ? 'Photo added' : 'Add parcel photo'}</Text>
        </TouchableOpacity>
        {error && <Text className="text-red-500 mb-2 text-center">{error}</Text>}
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          accessibilityRole="button"
          accessibilityLabel="Validate and Deliver"
          onPress={handleValidate}
          disabled={!photo || loading}
          style={{ opacity: !photo || loading ? 0.5 : 1 }}
        >
          <Text className="text-white text-lg font-semibold">Validate and Deliver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 