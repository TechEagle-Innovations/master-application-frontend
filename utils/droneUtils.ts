export function isAtDelivery(
  drone: { lat: number; long: number } | null,
  destination: { latitude: number; longitude: number } | undefined
): boolean {
  if (!drone || !destination) return false;
  const dist = Math.sqrt(
    Math.pow(drone.lat - destination.latitude, 2) +
    Math.pow(drone.long - destination.longitude, 2)
  );
  return dist < 0.0005; // ~50m threshold
} 