'use client';

import { useEffect, useRef, useState } from 'react';

interface SSEEvent {
  type: string;
  data: any;
}

export const useSSE = (url: string | null) => {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!url) return;

    const connect = () => {
      try {
        const eventSource = new EventSource(url);
        
        eventSource.onopen = () => {
          console.log('SSE connection established');
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setEvents(prev => [...prev, data]);
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };
        
        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          eventSource.close();
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };
        
        eventSourceRef.current = eventSource;
      } catch (error) {
        console.error('Failed to create SSE connection:', error);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url]);

  // Clear events if URL changes or component unmounts
  useEffect(() => {
    setEvents([]);
  }, [url]);

  return events;
};
