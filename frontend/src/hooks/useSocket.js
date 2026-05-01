"use client";
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (userId) => {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', userId);
      console.log('Connected to socket server');
    });

    socket.on('live_update', (data) => {
      setLastUpdate(data);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return { connected, lastUpdate, emit };
};
