import React, { useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function PreFlightChecklist() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { clearskyToken } = useAuth();

  // Fetch checklist items
  const fetchChecklistItems = useCallback(async () => {
    if (!clearskyToken) throw new Error(ERROR_MESSAGES.AUTH_ERROR);
    const response: any = await flightService.getPreFlight({
      headers: { "x-auth-clearsky": clearskyToken }
    });
    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error(ERROR_MESSAGES.DATA_ERROR);
    }
    return response.data;
  }, [clearskyToken]);

  // Submit checklist
  const submitChecklist = useCallback(async (items: ChecklistItem[]) => {
    // Attach photo URLs to items
    const updates = items.map((item, idx) => ({
      ...item,
      image: "https://image.jpg",
    }));
    await flightService.completePreFlight(
      { updates },
      { headers: { "x-auth-clearsky": clearskyToken } }
    );
    router.replace({
      pathname: '/(app)/dashboard',
      params: {
        message: 'Checklist submitted successfully',
        type: "success"
      }
    });
  }, [clearskyToken, router]);

  return (
    <PhotoChecklist
      headerText="Preflight Checklist"
      fetchChecklistItems={fetchChecklistItems}
      submitChecklist={submitChecklist}
    />
  );
}