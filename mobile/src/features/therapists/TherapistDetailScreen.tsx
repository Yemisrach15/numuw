import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { createBooking, fetchTherapistSlots, fetchTherapists } from "@/lib/api";
import { formatDateTime, formatTimeRange } from "@/lib/date";
import { useRemoteData } from "@/hooks/useRemoteData";
import type { Booking, AvailabilitySlot } from "@/types/api";

export function TherapistDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ therapistId?: string }>();
  const therapistId = Number(params.therapistId);

  const therapistsQuery = useRemoteData(fetchTherapists);

  const therapist = useMemo(
    () => therapistsQuery.data?.find((item) => item.id === therapistId) ?? null,
    [therapistId, therapistsQuery.data],
  );

  const loadSlots = useCallback(
    () => fetchTherapistSlots(therapistId),
    [therapistId],
  );
  const slotsQuery = useRemoteData(loadSlots);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  async function handleBook(slot: AvailabilitySlot) {
    setSelectedSlotId(slot.id);
    setBookingError(null);
    setBookingLoading(true);

    try {
      const booking: Booking = await createBooking(slot.id);
      router.push({
        pathname: "/(app)/bookings/[bookingId]",
        params: {
          bookingId: String(booking.id),
          status: booking.status,
          therapistName: booking.therapist_name,
          slotStart: booking.slot.start_time,
          slotEnd: booking.slot.end_time,
        },
      });
    } catch (cause) {
      setBookingError(
        cause instanceof Error ? cause.message : "Could not create booking.",
      );
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Therapist profile</Text>
        <Text style={styles.title}>{therapist?.name ?? "Therapist"}</Text>
        <Text style={styles.subtitle}>
          {therapist?.specialty ?? "Loading specialty…"}
        </Text>
      </View>

      {therapistsQuery.error ? (
        <Card>
          <Text style={styles.errorTitle}>Could not load therapist</Text>
          <Text style={styles.errorText}>
            {therapistsQuery.error instanceof Error
              ? therapistsQuery.error.message
              : "Try again."}
          </Text>
        </Card>
      ) : therapist ? (
        <Card style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.identityBlock}>
              <Text style={styles.profileName}>{therapist.name}</Text>
              <Text style={styles.profileSpecialty}>{therapist.specialty}</Text>
            </View>
            <StatusBadge
              status={slotsQuery.data?.length ? "confirmed" : "pending"}
            />
          </View>
          <Text style={styles.bio}>{therapist.bio}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaLabel}>Upcoming slots</Text>
              <Text style={styles.metaValue}>
                {therapist.upcoming_slots_count}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaLabel}>Next opening</Text>
              <Text style={styles.metaValue}>
                {therapist.next_available_slot
                  ? formatDateTime(therapist.next_available_slot.start_time)
                  : "None listed"}
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Available slots</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a slot to start the booking. The booking page will stay live
            until the status changes.
          </Text>
        </View>
        <Button
          label="Refresh"
          tone="ghost"
          onPress={() => void slotsQuery.refetch()}
        />
      </View>

      {slotsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading slots…</Text>
        </View>
      ) : slotsQuery.error ? (
        <Card>
          <Text style={styles.errorTitle}>Could not load slots</Text>
          <Text style={styles.errorText}>
            {slotsQuery.error instanceof Error
              ? slotsQuery.error.message
              : "Try again in a moment."}
          </Text>
        </Card>
      ) : (
        <FlatList
          data={slotsQuery.data ?? []}
          keyExtractor={(item) => String(item.id)}
          refreshing={slotsQuery.isFetching}
          onRefresh={() => void slotsQuery.refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Card>
              <Text style={styles.errorTitle}>No upcoming slots</Text>
              <Text style={styles.errorText}>
                The therapist does not have any unbooked future availability
                right now.
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <Card>
              <View style={styles.slotRow}>
                <View style={styles.slotCopy}>
                  <Text style={styles.slotTime}>
                    {formatTimeRange(item.start_time, item.end_time)}
                  </Text>
                  <Text style={styles.slotMeta}>{item.therapist_name}</Text>
                  <Text style={styles.slotMeta}>
                    {item.therapist_specialty}
                  </Text>
                </View>
                <Button
                  label={
                    selectedSlotId === item.id && bookingLoading
                      ? "Booking…"
                      : "Book"
                  }
                  loading={selectedSlotId === item.id && bookingLoading}
                  onPress={() => void handleBook(item)}
                  style={styles.bookButton}
                />
              </View>
            </Card>
          )}
        />
      )}

      {bookingError ? (
        <Text style={styles.errorText}>{bookingError}</Text>
      ) : null}

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backLink,
          pressed && styles.backLinkPressed,
        ]}
      >
        <Text style={styles.backLinkText}>Back</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
    gap: 8,
  },
  kicker: {
    color: "#6DD0FF",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    color: "#F5F7FA",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: "#B3C4D8",
    fontSize: 15,
    lineHeight: 22,
  },
  profileCard: {
    marginBottom: 18,
    gap: 14,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  identityBlock: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    color: "#F5F7FA",
    fontSize: 22,
    fontWeight: "900",
  },
  profileSpecialty: {
    color: "#9FE2FF",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  bio: {
    color: "#D2DEEA",
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
  },
  metaPill: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: 4,
  },
  metaLabel: {
    color: "#7F92AB",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  metaValue: {
    color: "#F5F7FA",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: "#F5F7FA",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#90A2B8",
    lineHeight: 19,
    maxWidth: 280,
  },
  loadingWrap: {
    paddingVertical: 28,
    alignItems: "center",
  },
  loadingText: {
    color: "#B3C4D8",
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  slotCopy: {
    flex: 1,
    gap: 4,
  },
  slotTime: {
    color: "#F5F7FA",
    fontSize: 17,
    fontWeight: "800",
  },
  slotMeta: {
    color: "#90A2B8",
    fontSize: 13,
    lineHeight: 18,
  },
  bookButton: {
    minWidth: 96,
  },
  errorTitle: {
    color: "#F5F7FA",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorText: {
    color: "#B3C4D8",
    lineHeight: 20,
  },
  backLink: {
    alignSelf: "center",
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backLinkPressed: {
    opacity: 0.7,
  },
  backLinkText: {
    color: "#6DD0FF",
    fontWeight: "700",
  },
});
