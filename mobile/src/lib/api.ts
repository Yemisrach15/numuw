import { AxiosError, create, type AxiosInstance } from "axios";

import { runtimeConfig } from "@/config/env";
import { getIdToken } from "@/lib/firebase";
import type { AvailabilitySlot, Booking, Therapist } from "@/types/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  signal?: AbortSignal;
};

const apiClient: AxiosInstance = create({
  baseURL: runtimeConfig.apiUrl,
  headers: {
    Accept: "application/json",
  },
});

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  if (options.auth !== false) {
    const token = await getIdToken();
    if (!token) {
      throw new ApiError("Sign in required.", 401, null);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await apiClient.request<T>({
      url: path,
      method: options.method ?? "GET",
      headers,
      data: options.body,
      signal: options.signal,
    });

    return response.data;
  } catch (cause) {
    if (cause instanceof AxiosError) {
      const payload = cause.response?.data ?? null;
      const message =
        payload && typeof payload === "object" && "detail" in payload
          ? String((payload as { detail: unknown }).detail)
          : typeof payload === "string"
            ? payload
            : cause.message || "Request failed.";
      throw new ApiError(message, cause.response?.status ?? 500, payload);
    }

    throw cause;
  }
}

export async function fetchTherapists() {
  return request<Therapist[]>("/therapists/");
}

export async function fetchTherapistSlots(therapistId: number) {
  return request<AvailabilitySlot[]>(`/therapists/${therapistId}/slots/`);
}

export async function fetchBookings() {
  return request<Booking[]>("/bookings/");
}

export async function createBooking(slotId: number) {
  return request<Booking>("/bookings/", {
    method: "POST",
    body: { slot_id: slotId },
  });
}
