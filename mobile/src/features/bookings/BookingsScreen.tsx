import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchBookings } from "@/lib/api";
import { formatDateTime, formatTimeRange } from "@/lib/date";
import { useRemoteData } from "@/hooks/useRemoteData";
import type { Booking } from "@/types/api";
import { useAuth } from "@/providers/AuthProvider";

export function BookingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const bookingsQuery = useRemoteData(fetchBookings);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Your activity</Text>
          <Text style={styles.title}>My bookings</Text>
          <Text style={styles.subtitle}>
            See every booking you made and open one to watch its status change
            live.
          </Text>
        </View>
        <Button
          label="Sign out"
          tone="ghost"
          onPress={signOut}
          style={styles.signOutButton}
        />
      </View>

      {bookingsQuery.isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading bookings…</Text>
        </View>
      ) : bookingsQuery.error ? (
        <Card>
          <Text style={styles.errorTitle}>Could not load bookings</Text>
          <Text style={styles.errorText}>
            {bookingsQuery.error instanceof Error
              ? bookingsQuery.error.message
              : "Try again in a moment."}
          </Text>
          <Button
            label="Retry"
            onPress={() => void bookingsQuery.refetch()}
            style={styles.retryButton}
          />
        </Card>
      ) : (
        <FlatList
          data={bookingsQuery.data ?? []}
          keyExtractor={(item) => String(item.id)}
          refreshing={bookingsQuery.isFetching}
          onRefresh={() => void bookingsQuery.refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Card>
              <Text style={styles.errorTitle}>No bookings yet</Text>
              <Text style={styles.errorText}>
                Pick a therapist to create the first request.
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onPress={() =>
                router.push({
                  pathname: "/(app)/bookings/[bookingId]",
                  params: bookingParams(item),
                })
              }
            />
          )}
        />
      )}
    </Screen>
  );
}

function bookingParams(booking: Booking) {
  return {
    bookingId: String(booking.id),
    status: booking.status,
    therapistName: booking.therapist_name,
    slotStart: booking.slot.start_time,
    slotEnd: booking.slot.end_time,
  };
}

function BookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.copyBlock}>
            <Text style={styles.therapist}>{booking.therapist_name}</Text>
            <Text style={styles.slot}>
              {formatTimeRange(booking.slot.start_time, booking.slot.end_time)}
            </Text>
          </View>
          <StatusBadge status={booking.status} />
        </View>

        <Text style={styles.createdAt}>
          Requested {formatDateTime(booking.created_at)}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
    gap: 14,
  },
  headerCopy: {
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
  signOutButton: {
    alignSelf: "flex-start",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#B3C4D8",
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
  retryButton: {
    marginTop: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  pressed: {
    transform: [{ scale: 0.988 }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  copyBlock: {
    flex: 1,
    gap: 6,
  },
  therapist: {
    color: "#F5F7FA",
    fontSize: 22,
    fontWeight: "900",
  },
  slot: {
    color: "#9FE2FF",
    fontSize: 14,
    fontWeight: "800",
  },
  createdAt: {
    marginTop: 14,
    color: "#90A2B8",
    fontSize: 13,
  },
});
