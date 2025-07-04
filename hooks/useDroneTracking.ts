import { useAuth } from '@/utils/auth/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export interface DroneTelemetry {
  id: string;
  lat: number;
  long: number;
  battery?: number;
  speed?: number;
  eta?: number;
  alt?:number;
  distance?: number;
  image?: string; // URL to drone image from backend
  imageUrl?: string; // Alternative key for image URL
  [key: string]: any; // For extensibility (altitude, voltage, etc.)
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  [key: string]: any; // For extensibility (alt, command, etc.)
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'| "error";
const SOCKET_URL = 'https://training.ws5002.techeagle.org';
export function useDroneTracking(flightId: string) {
  const [drone, setDrone] = useState<DroneTelemetry | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const socketRef = useRef<any>(null);
  const { clearskyToken } = useAuth()
 
  useEffect(() => {
      console.log("clearskyToken", clearskyToken, "flightId", flightId);
    if (!clearskyToken) {
     setConnectionStatus('error');
    }
    if (!flightId) return;
    const token=clearskyToken
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { page: 'drone-tracking', token, flightId },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SOCKET] Connected to server at', SOCKET_URL);
      setConnectionStatus('connected');
    });
    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected from server. Reason:', reason);
      setConnectionStatus('disconnected');
    });
    socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error);
    });
    socket.on('error', (error) => {
      console.error('[SOCKET] General error:', error);
    });
    socket.on('reconnect_attempt', (attempt) => {
      console.log('[SOCKET] Reconnect attempt:', attempt);
    });
    socket.on('reconnect', (attempt) => {
      console.log('[SOCKET] Successfully reconnected after', attempt, 'attempt(s)');
    });
    socket.on('server:monitor_data', (data: any) => {
      // console.log('[SOCKET] Received monitor data:', data);
      // Accept both [flightId, data] and direct data
      let droneData: any = data;
      if (Array.isArray(data) && data[0] === flightId) {
        droneData = data[1];
      }
      // Parse and normalize telemetry fields
      const lat = typeof droneData.lat === 'string' ? parseFloat(droneData.lat) : droneData.lat;
      const long = typeof droneData.long === 'string' ? parseFloat(droneData.long) : droneData.long;
      const battery = droneData.battery !== undefined ? Number(droneData.battery) : undefined;
      const speed = droneData.g_speed !== undefined ? Number(droneData.g_speed) : (droneData.speed !== undefined ? Number(droneData.speed) : undefined);
      const eta = droneData.eta !== undefined ? droneData.eta : undefined;
      const distance = droneData.distance !== undefined ? Number(droneData.distance) : undefined;
      const alt= droneData.alt !==undefined ? Number(droneData.alt) : undefined;
      setDrone({
        id: flightId,
        lat,
        long,
        battery,
        speed,
        eta,
        alt,
        distance,
        image: droneData.image || droneData.imageUrl, // prefer backend image if present
        ...droneData, // keep all other telemetry fields for extensibility
      });
    });
    socket.on('server:set_route', (data: any) => {
      // console.log('[SOCKET] Received set_route data:', data);
      let routeArray: any[] = [];
      if (Array.isArray(data)) {
        // Data is already an array of waypoints
        routeArray = data;
      } else if (data[flightId]) {
        // Data is an object keyed by flightId
        routeArray = data[flightId];
      }
      if (routeArray.length > 0) {
        const parsedRoute = routeArray
          .map((pt: any) => {
            // Accept both lat/long and lat/lng keys, and preserve extra fields
            const latitude = typeof pt.lat === 'string' ? parseFloat(pt.lat) : pt.lat;
            const longitude = pt.long !== undefined ? (typeof pt.long === 'string' ? parseFloat(pt.long) : pt.long)
              : (pt.lng !== undefined ? (typeof pt.lng === 'string' ? parseFloat(pt.lng) : pt.lng) : undefined);
            return { latitude, longitude, ...pt };
          })
          .filter((pt: any) => typeof pt.latitude === 'number' && typeof pt.longitude === 'number' && !isNaN(pt.latitude) && !isNaN(pt.longitude));
        // console.log('[SOCKET] Parsed route:', parsedRoute);
        setRoute(parsedRoute);
      }
    });

    console.log('[SOCKET] Emitting client:get_route and client:getFlightData for flightId:', flightId);
    socket.emit('client:get_route', flightId);
    socket.emit('client:getFlightData', flightId);

    return () => {
      console.log('[SOCKET] Disconnecting socket...');
      socket.disconnect();
    };
  }, [flightId, SOCKET_URL]);

  return { drone, route, connectionStatus };
} 