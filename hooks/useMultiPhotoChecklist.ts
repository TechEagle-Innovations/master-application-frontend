import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export function useMultiPhotoChecklist(count: number) {
  const [photos, setPhotos] = useState<(string | null)[]>(Array(count).fill(null));
  const [errors, setErrors] = useState<(string | null)[]>(Array(count).fill(null));
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const takePhotoForIndex = async (idx: number): Promise<boolean> => {
    setLoadingIndex(idx);
    setErrors(prev => prev.map((e, i) => i === idx ? null : e));

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrors(prev => prev.map((e, i) => i === idx ? 'Camera permission denied' : e));
        return false;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.back,
      });

      if (result.canceled) {
        return false;
      }

      if (result.assets && result.assets.length > 0) {
        setPhotos(prev => prev.map((p, i) => i === idx ? result.assets[0].uri : p));
        return true;
      }

      setErrors(prev => prev.map((e, i) => i === idx ? 'No photo was taken' : e));
      return false;
    } catch (e) {
      setErrors(prev => prev.map((e, i) => i === idx ? 'Failed to take photo' : e));
      return false;
    } finally {
      setLoadingIndex(null);
    }
  };

  const resetPhotoForIndex = (idx: number) => {
    setPhotos(prev => prev.map((p, i) => i === idx ? null : p));
    setErrors(prev => prev.map((e, i) => i === idx ? null : e));
  };

  return { photos, errors, loadingIndex, takePhotoForIndex, resetPhotoForIndex };
}