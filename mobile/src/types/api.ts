export type BookingStatus = "pending" | "confirmed" | "failed" | "cancelled";

export type AvailabilitySlot = {
  id: number;
  therapist: number;
  therapist_name: string;
  therapist_specialty: string;
  start_time: string;
  end_time: string;
};

export type Therapist = {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  upcoming_slots_count: number;
  next_available_slot: AvailabilitySlot | null;
};

export type Booking = {
  id: number;
  slot: AvailabilitySlot;
  therapist_name: string;
  status: BookingStatus;
  created_at: string;
};
