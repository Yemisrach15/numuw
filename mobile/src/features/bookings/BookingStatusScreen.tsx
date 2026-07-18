import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { useBookingChannel } from "@/hooks/useBookingChannel";
import { formatTimeRange } from "@/lib/date";
import type { BookingStatus } from "@/types/api";

export function BookingStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId?: string;
    status?: string;
    therapistName?: string;
    slotStart?: string;
    slotEnd?: string;
  }>();

  const bookingId = Number(params.bookingId);
  const initialStatus = useMemo(
    () => normalizeStatus(params.status) ?? "pending",
    [params.status],
  );
  const [status, setStatus] = useState<BookingStatus>(initialStatus);

  const channelState = useBookingChannel(
    Number.isFinite(bookingId) ? bookingId : null,
    (nextStatus) => {
      setStatus(nextStatus);
    },
  );

  const message =
    status === "pending"
      ? "Your booking is waiting on backend confirmation. This screen updates live when the websocket consumer pushes the new status."
      : status === "confirmed"
        ? "The therapist confirmed the booking. You can return to your bookings list now."
        : "The booking could not be confirmed. Pick another available slot if you want to try again.";

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Live booking status</Text>
        <Text style={styles.title}>{params.therapistName ?? "Booking"}</Text>
        <Text style={styles.subtitle}>
          {params.slotStart && params.slotEnd
            ? formatTimeRange(params.slotStart, params.slotEnd)
            : "Waiting for booking details"}
        </Text>
      </View>

      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusCopy}>
            <Text style={styles.sectionLabel}>Current status</Text>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <StatusBadge status={status} />
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.connectionRow}>
          <Text style={styles.connectionLabel}>Realtime feed</Text>
          <Text
            style={[
              styles.connectionValue,
              channelState.connected ? styles.connected : styles.reconnecting,
            ]}
          >
            {channelState.connected
              ? "Connected"
              : channelState.reconnecting
                ? "Reconnecting"
                : "Connecting"}
          </Text>
        </View>

        {channelState.error ? (
          <Text style={styles.connectionError}>{channelState.error}</Text>
        ) : null}

        {status === "pending" ? (
          <View style={styles.pendingBlock}>
            <ActivityIndicator color="#6DD0FF" />
            <Text style={styles.pendingText}>
              Keeping this page open until the booking is confirmed or marked
              failed.
            </Text>
          </View>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Booking reference</Text>
        <Text style={styles.reference}>#{params.bookingId ?? "unknown"}</Text>
        <Text style={styles.referenceHint}>
          The backend should stream this booking over a Django Channels consumer
          and update the status without polling.
        </Text>
      </Card>

      <Button
        label="Back to bookings"
        tone="secondary"
        onPress={() => router.replace("/(app)/bookings")}
        style={styles.backButton}
      />
    </Screen>
  );
}

function normalizeStatus(value: string | undefined): BookingStatus | null {
  if (!value) {
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

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  hero: {
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
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#B3C4D8",
    fontSize: 15,
    lineHeight: 22,
  },
  statusCard: {
    gap: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  statusCopy: {
    flex: 1,
    gap: 6,
  },
  sectionLabel: {
    color: "#7F92AB",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "800",
  },
  statusText: {
    color: "#F5F7FA",
    fontSize: 24,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  message: {
    color: "#D2DEEA",
    fontSize: 15,
    lineHeight: 22,
  },
  connectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  connectionLabel: {
    color: "#7F92AB",
    fontSize: 13,
    fontWeight: "700",
  },
  connectionValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  connected: {
    color: "#AEECC8",
  },
  reconnecting: {
    color: "#9FE2FF",
  },
  connectionError: {
    color: "#FFB6B6",
    lineHeight: 20,
  },
  pendingBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 4,
  },
  pendingText: {
    flex: 1,
    color: "#90A2B8",
    lineHeight: 20,
  },
  reference: {
    marginTop: 6,
    color: "#F5F7FA",
    fontSize: 18,
    fontWeight: "800",
  },
  referenceHint: {
    marginTop: 10,
    color: "#90A2B8",
    lineHeight: 20,
  },
  backButton: {
    marginTop: 6,
  },
});
