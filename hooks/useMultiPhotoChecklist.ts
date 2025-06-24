import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export function useMultiPhotoChecklist(count: number) {
  const [photos, setPhotos] = useState<(string | null)[]>(Array(count).fill(null));
  const [errors, setErrors] = useState<(string | null)[]>(Array(count).fill(null));
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const takePhotoForIndex = async (idx: number) => {
    setLoadingIndex(idx);
    setErrors((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrors((prev) => {
          const next = [...prev];
          next[idx] = 'Camera permission is required';
          return next;
        });
        setLoadingIndex(null);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos((prev) => {
          const next = [...prev];
          next[idx] = result.assets[0].uri;
          return next;
        });
      } else if (result.canceled) {
        setErrors((prev) => {
          const next = [...prev];
          next[idx] = 'Photo capture cancelled';
          return next;
        });
      } else {
        setErrors((prev) => {
          const next = [...prev];
          next[idx] = 'Photo not taken';
          return next;
        });
      }
    } catch (e) {
      setErrors((prev) => {
        const next = [...prev];
        next[idx] = 'Failed to take photo';
        return next;
      });
    }
    setLoadingIndex(null);
  };

  const resetPhotoForIndex = (idx: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setErrors((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  return { photos, errors, loadingIndex, takePhotoForIndex, resetPhotoForIndex };
} 