import { runtimeConfig } from "@/config/env";
import type { BookingStatus } from "@/types/api";

type BookingSocketPayload = {
  type?: string;
  event?: string;
  id?: number | string;
  booking_id?: number | string;
  status?: string;
  message?: string;
  booking?: {
    id?: number | string;
    status?: string;
  };
  data?: {
    booking?: {
      id?: number | string;
      status?: string;
    };
  };
};

function normalizeStatus(value: unknown): BookingStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.toLowerCase();
  if (
    normalized === "pending" ||
    normalized === "confirmed" ||
    normalized === "failed" ||
    normalized === "cancelled"
  ) {
    return normalized;
  }

  return null;
}

export function buildBookingSocketUrl(bookingId: number) {
  return `${runtimeConfig.wsUrl.replace(/\/+$/, "")}/bookings/${bookingId}/`;
}

export function extractBookingStatus(payload: unknown, bookingId: number) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = payload as BookingSocketPayload;
  const bookingObject = message.booking ?? message.data?.booking;

  if (bookingObject && Number(bookingObject.id) === bookingId) {
    return normalizeStatus(bookingObject.status);
  }

  if (
    Number(message.booking_id) === bookingId ||
    Number(message.id) === bookingId
  ) {
    return normalizeStatus(message.status ?? bookingObject?.status);
  }

  return normalizeStatus(bookingObject?.status ?? message.status);
}
