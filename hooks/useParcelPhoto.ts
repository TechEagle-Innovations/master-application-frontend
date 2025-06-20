import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export function useParcelPhoto() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    setLoading(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('Camera permission is required');
        setLoading(false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      } else if (result.canceled) {
        setError('Photo capture cancelled');
      } else {
        setError('Photo not taken');
      }
    } catch (e) {
      setError('Failed to take photo');
    }
    setLoading(false);
  };

  // const pickFromGallery = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     if (!permission.granted) {
  //       setError('Gallery permission is required');
  //       setLoading(false);
  //       return;
  //     }
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       quality: 0.7,
  //     });
  //     if (!result.canceled && result.assets && result.assets.length > 0) {
  //       setPhoto(result.assets[0].uri);
  //     } else if (result.canceled) {
  //       setError('Image selection cancelled');
  //     } else {
  //       setError('Image not selected');
  //     }
  //   } catch (e) {
  //     setError('Failed to select image');
  //   }
  //   setLoading(false);
  // };

  const reset = () => setPhoto(null);

  return { photo, setPhoto, error, loading, takePhoto, reset };
} 