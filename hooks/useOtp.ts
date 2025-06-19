import { useState } from 'react';

export function useOtp(length = 6) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isComplete = otp.every(d => d);

  const reset = () => setOtp(Array(length).fill(''));

  // Simulate OTP verification (replace with real API call)
  const verifyOtp = async () => {
    setLoading(true);
    setError(null);
    await new Promise(res => setTimeout(res, 1000));
    if (otp.join('') === '123456') {
      setLoading(false);
      return true;
    } else {
      setError('Invalid OTP');
      setLoading(false);
      return false;
    }
  };

  return { otp, setOtp, isComplete, error, loading, verifyOtp, reset };
} 