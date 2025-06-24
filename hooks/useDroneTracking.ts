import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export interface DroneTelemetry {
  id: string;
  lat: number;
  long: number;
  battery?: number;
  speed?: number;
  eta?: number;
  distance?: number;
  [key: string]: any; // For extensibility (altitude, voltage, etc.)
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
const SOCKET_URL = 'http://192.168.1.4:5002';
 const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRueWFuZXNod2FyLnN1cnlhdmFuc2hpQHRlY2hlYWdsZS5pbiIsImlhdCI6MTc1MDc2NDg1NSwiZXhwIjoxNzUwNzc1NjU1fQ.jaulAnT8Lm6ecbcJ990awjF1XYYw_9Mr0qvIpWF7hkE"
export function useDroneTracking(flightId: string) {
  const [drone, setDrone] = useState<DroneTelemetry | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!flightId) return;
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { page: 'drone-tracking',token,  flightId },
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
      console.log('[SOCKET] Received monitor data:', data);
      if (data[0] === flightId) setDrone({ id: flightId, ...data[1] });
    });
    socket.on('server:set_route', (data: any) => {
      console.log('[SOCKET] Received set_route data:', data);
      if (data[flightId]) setRoute(data[flightId].map((pt: any) => ({ latitude: pt.lat, longitude: pt.long })));
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