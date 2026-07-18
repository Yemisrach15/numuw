import { useEffect, useRef, useState } from "react";

import { buildBookingSocketUrl, extractBookingStatus } from "@/lib/websocket";
import type { BookingStatus } from "@/types/api";

type BookingChannelState = {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
};

export function useBookingChannel(
  bookingId: number | null,
  onStatus: (status: BookingStatus) => void,
) {
  const handlerRef = useRef(onStatus);
  const [state, setState] = useState<BookingChannelState>({
    connected: false,
    reconnecting: false,
    error: null,
  });

  useEffect(() => {
    handlerRef.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    if (!bookingId || Number.isNaN(bookingId)) {
      return;
    }

    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      socket = new WebSocket(buildBookingSocketUrl(bookingId));

      socket.onopen = () => {
        if (cancelled) {
          return;
        }

        setState({ connected: true, reconnecting: false, error: null });
      };

      socket.onmessage = (event) => {
        if (cancelled) {
          return;
        }

        try {
          const payload = JSON.parse(event.data as string) as unknown;
          const nextStatus = extractBookingStatus(payload, bookingId);
          if (nextStatus) {
            handlerRef.current(nextStatus);
          }
        } catch {
          setState((previous) => ({
            ...previous,
            error: "Received an unreadable booking update.",
          }));
        }
      };

      socket.onerror = () => {
        if (cancelled) {
          return;
        }

        setState((previous) => ({
          ...previous,
          connected: false,
          reconnecting: true,
          error: "Live connection interrupted. Reconnecting...",
        }));
      };

      socket.onclose = () => {
        if (cancelled) {
          return;
        }

        setState((previous) => ({
          ...previous,
          connected: false,
          reconnecting: true,
          error: "Live connection closed. Reconnecting...",
        }));

        reconnectTimer = setTimeout(connect, 1500);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [bookingId]);

  return state;
}
