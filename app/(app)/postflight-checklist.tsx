import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/utils/auth/AuthContext';
import { flightService } from '@/utils/api/services/FlightService';
import PhotoChecklist, { ChecklistItem } from '@/components/PhotoChecklist';

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your internet connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  DATA_ERROR: 'Invalid data received from server.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  INCOMPLETE_CHECKLIST: 'Please complete all checklist items before submitting.',
};

export default function PostFlightChecklist() {
  const router = useRouter();
  const { clearskyToken } = useAuth();

  // Fetch checklist items
  const fetchChecklistItems = useCallback(async () => {
    if (!clearskyToken) throw new Error(ERROR_MESSAGES.AUTH_ERROR);
    const response: any = await flightService.getPostFlight({
      headers: { "x-auth-clearsky": clearskyToken }
    });
    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error(ERROR_MESSAGES.DATA_ERROR);
    }
    return response.data;
  }, [clearskyToken]);

  // Submit checklist
  const submitChecklist = useCallback(async (items: ChecklistItem[], photos: (string | null)[]) => {
    const updates = items.map((item, idx) => ({
      ...item,
      image: photos[idx] || undefined,
    }));
    await flightService.completePostFlight(
      { updates },
      { headers: { "x-auth-clearsky": clearskyToken } }
    );
    router.push('/(app)/pre-parcel-validation')
  }, [clearskyToken, router]);

  return (
    <PhotoChecklist
      headerText="Post-Flight Checklist"
      fetchChecklistItems={fetchChecklistItems}
      submitChecklist={submitChecklist}
    />
  );
} 