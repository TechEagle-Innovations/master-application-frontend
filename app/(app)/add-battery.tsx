import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Button from '@/components/auth/Button';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

const BATTERY_TYPES = ['Li-ion', 'NiMH', 'Lead Acid', 'LiPo'];

export default function AddBattery() {
  const insets = useSafeAreaInsets();
  const [batteryId, setBatteryId] = useState('');
  const [model, setModel] = useState('');
  const [numCells, setNumCells] = useState('');
  const [voltage, setVoltage] = useState('');
  const [mah, setMah] = useState('');
  const [batteryType, setBatteryType] = useState(BATTERY_TYPES[0]);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddBattery = async () => {
    setLoading(true);
    // TODO: Integrate with batteryService to add battery
    setTimeout(() => {
      setLoading(false);
      // TODO: Navigate back or show success
    }, 1200);
  };

  return (
    <View className="flex-1 bg-white">
      <Header insets={insets} text="Add New Battery" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Image Picker */}
        <TouchableOpacity
          className="w-full h-36 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center mb-6"
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {image ? (
            <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
          ) : (
            <>
              <Text className="text-gray-400 text-lg">Tap to add battery image</Text>
            </>
          )}
        </TouchableOpacity>
        {/* Battery ID */}
        <Text className="mb-1 text-gray-700 mb-2">Battery ID</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
          placeholder="Enter Battery ID"
          value={batteryId}
          onChangeText={setBatteryId}
        />
        {/* Model */}
        <Text className="mb-1 text-gray-700 mb-2">Model</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
          placeholder="Enter battery model"
          value={model}
          onChangeText={setModel}
        />
        {/* Number of Cells */}
        <Text className="mb-1 text-gray-700 mb-2">Number of Cells</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
          placeholder="Enter number of cells"
          value={numCells}
          onChangeText={setNumCells}
          keyboardType="numeric"
        />
        {/* Voltage */}
        <Text className="mb-1 text-gray-700 mb-2">Voltage</Text>
        <View className="flex-row items-center mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Enter voltage"
            value={voltage}
            onChangeText={setVoltage}
            keyboardType="numeric"
          />
          <Text className="ml-2 text-gray-500">V</Text>
        </View>
        {/* MAH (Capacity) */}
        <Text className="mb-1 text-gray-700 mb-2">MAH (Capacity)</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
          placeholder="Enter MAH"
          value={mah}
          onChangeText={setMah}
          keyboardType="numeric"
        />
        {/* Battery Type */}
        <Text className="mb-1 text-gray-700 mb-2">Battery Type</Text>
        <View className="border border-gray-300 rounded-lg overflow-hidden mb-8">
          <Picker
            selectedValue={batteryType}
            onValueChange={(itemValue) => setBatteryType(itemValue)}
            // style={{ height: 50 }}
          >
            {BATTERY_TYPES.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>
        {/* Add Battery Button */}
        <Button
          loading={loading}
          actionFunction={handleAddBattery}
          buttonText="Add Battery"
          buttonTextLoading="Adding..."
        />
      </ScrollView>
    </View>
  );
} 