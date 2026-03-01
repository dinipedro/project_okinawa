import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useWebSocket = (namespace: string = '/') => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [namespace]);

  const connectSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        setError('No authentication token found');
        return;
      }

      socketRef.current = io(`${SOCKET_URL}${namespace}`, {
        auth: {
          token,
        },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log(`Connected to ${namespace}`);
        setConnected(true);
        setError(null);
      });

      socketRef.current.on('disconnect', () => {
        console.log(`Disconnected from ${namespace}`);
        setConnected(false);
      });

      socketRef.current.on('error', (err: any) => {
        console.error(`Socket error on ${namespace}:`, err);
        setError(err.message || 'Socket connection error');
      });

      socketRef.current.on('connect_error', (err: any) => {
        console.error(`Socket connection error on ${namespace}:`, err);
        setError(err.message || 'Failed to connect to socket');
      });
    } catch (err: any) {
      setError(err.message || 'Failed to initialize socket');
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  };

  const emit = (event: string, data?: any) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  const joinRoom = (room: string) => {
    emit('join', { room });
  };

  const leaveRoom = (room: string) => {
    emit('leave', { room });
  };

  return {
    socket: socketRef.current,
    connected,
    error,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    reconnect: connectSocket,
    disconnect: disconnectSocket,
  };
};
