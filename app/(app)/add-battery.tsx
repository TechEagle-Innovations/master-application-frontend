// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Header from '@/components/Header';
// import Button from '@/components/auth/Button';
// import * as ImagePicker from 'expo-image-picker';
// import { Picker } from '@react-native-picker/picker';
// import { batteryService } from '@/utils/api/services/BatteryService';
// import { useImageUpload } from '@/hooks/useImageUpload';
// import { useRouter } from 'expo-router';

// const BATTERY_TYPES = ['Li-ion', 'NiMH', 'Lead Acid', 'LiPo'];

// export default function AddBattery() {
//   const insets = useSafeAreaInsets();
//   const [batteryId, setBatteryId] = useState('');
//   const [model, setModel] = useState('');
//   const [numCells, setNumCells] = useState('');
//   const [voltage, setVoltage] = useState('');
//   const [mah, setMah] = useState('');
//   const [batteryType, setBatteryType] = useState(BATTERY_TYPES[0]);
//   const [image, setImage] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const {uploadImage} = useImageUpload();
//   const router = useRouter();

//   const getNameAndType = (asset: any) => {
//     let name = asset.fileName || 'photo.jpg';
//     let type = asset.type || 'image/jpeg';
//     return { name, type };
//   };
//   const pickImage = async (): Promise<boolean> => {
//     try {
//       const permission = await ImagePicker.requestCameraPermissionsAsync();
//       if (!permission.granted) {
       
//         return false;
//       }
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ['images'],
//         allowsEditing: false,
//         aspect: [4, 3],
//         quality: 0.8,
//         cameraType: ImagePicker.CameraType.back,
//       });
//       console.log("IMAGE RESULT", JSON.stringify(result));
//       if (result.canceled) {
//         return false;
//       }
//       if (result.assets && result.assets.length > 0) {
//         const asset = result.assets[0];
//         const { name, type } = getNameAndType(asset);
//         // Upload the image and get the URL
//         const url = await uploadImage(asset.uri, name, type);
//         if (url) {
//           setImage(url);
//           return true;
//         } else {
//           return false;
//         }
//       }
//       return false;
//     } catch (e) {
//       return false;
//     }
//   };
//   // const pickImage = async () => {
//   //   let result = await ImagePicker.launchImageLibraryAsync({
//   //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//   //     allowsEditing: true,
//   //     aspect: [4, 3],
//   //     quality: 1,
//   //   });
//   //   if (!result.canceled && result.assets && result.assets.length > 0) {
//   //     setImage(result.assets[0].uri);
//   //   }
//   // };

//   const handleAddBattery = async () => {
//     setLoading(true);
//     // TODO: Integrate with batteryService to add battery
//     const batteryData = {
//       model,
//       num_of_cells: parseInt(numCells, 10),
//       voltage: parseFloat(voltage),
//       mah: parseInt(mah, 10),
//       battery_type: batteryType.toLowerCase() as 'li-ion' | 'li-po',
//       image: image || '',
//       current_voltage: parseFloat(voltage), 
//       curr_max_vdiff: 0, // Placeholder for max voltage difference
//     };
//     try {
//       // Call the battery service to add the battery
//       // await batteryService.addBattery(batteryData);
//       const battery= await batteryService.addBattery(batteryData);
//       console.log('Battery added:', battery);
//       console.log('BatteryDATA:', batteryData);
//     } catch (error) {
//       console.error('Error adding battery:', error);
//       // Handle error (e.g., show alert)
//     }finally{
//       setLoading(false);
//       router.back();
//     }
    
//   };

//   return (
//     <View className="flex-1 bg-white">
//       <Header insets={insets} text="Add New Battery" />
//       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
//         {/* Image Picker */}
//         <TouchableOpacity
//           className="w-full h-36 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center mb-6"
//           onPress={pickImage}
//           activeOpacity={0.8}
//         >
//           {image ? (
//             <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
//           ) : (
//             <>
//               <Text className="text-gray-400 text-lg">Tap to add battery image</Text>
//             </>
//           )}
//         </TouchableOpacity>
//         {/* Battery ID */}
//         {/* <Text className="mb-1 text-gray-700 mb-2">Battery ID</Text>
//         <TextInput
//           className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
//           placeholder="Enter Battery ID"
//           value={batteryId}
//           onChangeText={setBatteryId}
//         /> */}
//         {/* Model */}
//         <Text className="mb-1 text-gray-700 mb-2">Model</Text>
//         <TextInput
//           className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
//           placeholder="Enter battery model"
//           value={model}
//           onChangeText={setModel}
//         />
//         {/* Number of Cells */}
//         <Text className="mb-1 text-gray-700 mb-2">Number of Cells</Text>
//         <TextInput
//           className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
//           placeholder="Enter number of cells"
//           value={numCells}
//           onChangeText={setNumCells}
//           keyboardType="numeric"
//         />
//         {/* Voltage */}
//         <Text className="mb-1 text-gray-700 mb-2">Voltage</Text>
//         <View className="flex-row items-center mb-4">
//           <TextInput
//             className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base"
//             placeholder="Enter voltage"
//             value={voltage}
//             onChangeText={setVoltage}
//             keyboardType="numeric"
//           />
//           <Text className="ml-2 text-gray-500">V</Text>
//         </View>
//         {/* MAH (Capacity) */}
//         <Text className="mb-1 text-gray-700 mb-2">MAH (Capacity)</Text>
//         <TextInput
//           className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
//           placeholder="Enter MAH"
//           value={mah}
//           onChangeText={setMah}
//           keyboardType="numeric"
//         />
//         {/* Battery Type */}
//         <Text className="mb-1 text-gray-700 mb-2">Battery Type</Text>
//         <View className="border border-gray-300 rounded-lg overflow-hidden mb-8">
//           <Picker
//             selectedValue={batteryType}
//             onValueChange={(itemValue) => setBatteryType(itemValue)}
//             // style={{ height: 50 }}
//           >
//             {BATTERY_TYPES.map((type) => (
//               <Picker.Item key={type} label={type} value={type} />
//             ))}
//           </Picker>
//         </View>
//         {/* Add Battery Button */}
//         <Button
//           loading={loading}
//           actionFunction={handleAddBattery}
//           buttonText="Add Battery"
//           buttonTextLoading="Adding..."
//         />
//       </ScrollView>
//     </View>
//   );
// } 
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Button from '@/components/auth/Button';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { batteryService } from '@/utils/api/services/BatteryService';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useRouter } from 'expo-router';

const BATTERY_TYPES = ['Li-ion', 'NiMH', 'Lead Acid', 'LiPo'];

export default function AddBattery() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [batteryId, setBatteryId] = useState('');
  const [model, setModel] = useState('');
  const [numCells, setNumCells] = useState('');
  const [voltage, setVoltage] = useState('');
  const [mah, setMah] = useState('');
  const [batteryType, setBatteryType] = useState(BATTERY_TYPES[0]);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { uploadImage } = useImageUpload();
  const router = useRouter();

  const getNameAndType = (asset: any) => {
    let name = asset.fileName || 'photo.jpg';
    let type = asset.type || 'image/jpeg';
    return { name, type };
  };

  const pickImage = async (): Promise<boolean> => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return false;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.back,
      });
      
      if (result.canceled) {
        return false;
      }
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const { name, type } = getNameAndType(asset);
        const url = await uploadImage(asset.uri, name, type);
        if (url) {
          setImage(url);
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleAddBattery = async () => {
    setLoading(true);
    const batteryData = {
      model,
      num_of_cells: parseInt(numCells, 10),
      voltage: parseFloat(voltage),
      mah: parseInt(mah, 10),
      battery_type: batteryType.toLowerCase(),
      image: image || '',
      current_voltage: parseFloat(voltage), 
      curr_max_vdiff: 0,
    };
    
    try {
      await batteryService.addBattery(batteryData);
      router.back();
    } catch (error) {
      console.error('Error adding battery:', error);
    } finally {
      setLoading(false);
    }
  };

  const focusNextField = (nextField: React.RefObject<TextInput>) => {
    nextField.current?.focus();
  };

  // Create refs for all text inputs
  const modelRef = useRef<TextInput>(null);
  const numCellsRef = useRef<TextInput>(null);
  const voltageRef = useRef<TextInput>(null);
  const mahRef = useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
          <Header insets={insets} text="Add New Battery" />
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ 
              padding: 20,
              paddingBottom: insets.bottom + 20 // Extra padding for keyboard
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Image Picker */}
            <TouchableOpacity
              className="w-full h-36 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center mb-6"
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={{ width: '100%', height: '100%', borderRadius: 12 }} 
                  resizeMode="cover" 
                />
              ) : (
                <Text className="text-gray-400 text-lg">Tap to add battery image</Text>
              )}
            </TouchableOpacity>

            {/* Model */}
            <Text className="mb-1 text-gray-700 mb-2">Model</Text>
            <TextInput
              ref={modelRef}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
              placeholder="Enter battery model"
              value={model}
              onChangeText={setModel}
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(numCellsRef)}
            />

            {/* Number of Cells */}
            <Text className="mb-1 text-gray-700 mb-2">Number of Cells</Text>
            <TextInput
              ref={numCellsRef}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
              placeholder="Enter number of cells"
              value={numCells}
              onChangeText={setNumCells}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField(voltageRef)}
            />

            {/* Voltage */}
            <Text className="mb-1 text-gray-700 mb-2">Voltage</Text>
            <View className="flex-row items-center mb-4">
              <TextInput
                ref={voltageRef}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter voltage"
                value={voltage}
                onChangeText={setVoltage}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => focusNextField(mahRef)}
              />
              <Text className="ml-2 text-gray-500">V</Text>
            </View>

            {/* MAH (Capacity) */}
            <Text className="mb-1 text-gray-700 mb-2">MAH (Capacity)</Text>
            <TextInput
              ref={mahRef}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
              placeholder="Enter MAH"
              value={mah}
              onChangeText={setMah}
              keyboardType="numeric"
              returnKeyType="done"
            />

            {/* Battery Type */}
            <Text className="mb-1 text-gray-700 mb-2">Battery Type</Text>
            <View className="border border-gray-300 rounded-lg overflow-hidden mb-8">
              <Picker
                selectedValue={batteryType}
                onValueChange={(itemValue) => setBatteryType(itemValue)}
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}