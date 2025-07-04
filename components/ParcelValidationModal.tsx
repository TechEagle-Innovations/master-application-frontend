import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface ParcelValidationModalProps {
  visible: boolean;
  onValidate: () => void;
  onClose: () => void;
  options: string[];
  loading: boolean;
  error: string | null;
  photo: string | null;
  onTakePhoto: () => void;
  selectedOption: string | null;
  setSelectedOption: (option: string | null ) => void;
}

const ParcelValidationModal: React.FC<ParcelValidationModalProps> = ({
  visible,
  onValidate,
  onClose,
  options,
  loading,
  error,
  photo,
  onTakePhoto,
  selectedOption,
  setSelectedOption,
}) => {
  if (!visible) return null;
  return (
    <View className="absolute left-0 right-0 bottom-0 top-0 z-[100] bg-black/25 justify-end">
      <View className="bg-white rounded-t-3xl px-6 py-6 min-h-[340px]">
        <Text className="text-[22px] font-bold mb-3">Parcel Validation</Text>
        <Text className="text-base text-gray-500 mb-4">Select delivery option</Text>
        <View className="w-full my-2 border border-gray-300 rounded-lg">
          <Picker
            selectedValue={selectedOption}
            onValueChange={(itemValue) => setSelectedOption(itemValue)}
            style={{ width: '100%' }}
          >
            <Picker.Item label="Select an option..." value="" />
            {options.map(option => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>
        <Pressable
          onPress={onTakePhoto}
          style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: '#bdbdbd', borderRadius: 16 }}
          className="items-center justify-center min-h-[120px] mb-4 p-3"
          accessibilityRole="button"
          accessibilityLabel="Add parcel photo"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#94a3b8" />
          ) : photo ? (
            <Image source={{ uri: photo }} style={{ width: 100, height: 100, borderRadius: 12, marginBottom: 8 }} />
          ) : (
            <Ionicons name="camera" size={36} color="#bdbdbd" />
          )}
          <Text className="text-gray-500 mt-2">{photo ? 'Photo added' : 'Add parcel photo'}</Text>
        </Pressable>
        {error && <Text className="text-red-600 mb-2">{error}</Text>}
        <TouchableOpacity
          className="bg-[#ff670f] rounded-xl py-4 items-center mt-2"
          style={{ opacity: !selectedOption || !photo || loading ? 0.5 : 1 }}
          onPress={onValidate}
          disabled={!selectedOption || !photo || loading}
        >
          <Text className="text-white text-lg font-bold">VALIDATE</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} className="items-center mt-3">
          <Text className="text-[#2962ff] text-base">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ParcelValidationModal; 