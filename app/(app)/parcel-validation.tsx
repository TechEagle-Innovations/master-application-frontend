import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { useParcelPhoto } from '../../hooks/useParcelPhoto';

export default function ParcelValidation() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { photo, loading, error, takePhoto, pickFromGallery } = useParcelPhoto();

  const handleAddPhoto = async () => {
    await takePhoto();
  };

  const handlePickGallery = async () => {
    await pickFromGallery();
  };

  const handleValidate = () => {
    // Mark shipment as delivered, then navigate or show success
    // For now, just go back
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 bg-white border-b border-gray-100" style={{ paddingTop: insets.top, minHeight: 56 + insets.top }}>
        <TouchableOpacity onPress={router.back} className="p-2" accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold mb-6">Parcel Validation</Text>
        <Text className="text-lg text-gray-500 mb-12">Click an Image of the Parcel</Text>
        <View className="flex-row justify-center mb-4">
          <TouchableOpacity
            className="mx-2 px-4 py-2 border border-gray-300 rounded-lg flex-row items-center"
            onPress={handleAddPhoto}
            disabled={loading}
          >
            <Camera size={20} color="#94a3b8" />
            <Text className="ml-2 text-gray-700">Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mx-2 px-4 py-2 border border-gray-300 rounded-lg flex-row items-center"
            onPress={handlePickGallery}
            disabled={loading}
          >
            <ImageIcon size={20} color="#94a3b8" />
            <Text className="ml-2 text-gray-700">Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
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