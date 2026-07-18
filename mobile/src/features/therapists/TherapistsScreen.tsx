import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { fetchTherapists } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { useRemoteData } from "@/hooks/useRemoteData";
import type { Therapist } from "@/types/api";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";

export function TherapistsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const therapistsQuery = useRemoteData(fetchTherapists);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Browse clinicians</Text>
          <Text style={styles.title}>Choose a therapist</Text>
          <Text style={styles.subtitle}>
            Pick someone by specialty and book one of their upcoming slots.
          </Text>
        </View>
        <Button
          label="Sign out"
          tone="ghost"
          onPress={signOut}
          style={styles.signOutButton}
        />
      </View>

      {therapistsQuery.isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading therapists…</Text>
        </View>
      ) : therapistsQuery.error ? (
        <Card>
          <Text style={styles.errorTitle}>Could not load therapists</Text>
          <Text style={styles.errorText}>
            {therapistsQuery.error instanceof Error
              ? therapistsQuery.error.message
              : "Try again in a moment."}
          </Text>
          <Button
            label="Retry"
            onPress={() => void therapistsQuery.refetch()}
            style={styles.retryButton}
          />
        </Card>
      ) : (
        <FlatList
          data={therapistsQuery.data ?? []}
          keyExtractor={(item) => String(item.id)}
          refreshing={therapistsQuery.isFetching}
          onRefresh={() => void therapistsQuery.refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Card>
              <Text style={styles.errorTitle}>No therapists yet</Text>
              <Text style={styles.errorText}>
                Seed the backend demo data to populate the list.
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <TherapistCard
              therapist={item}
              onPress={() =>
                router.push({
                  pathname: "/(app)/therapists/[therapistId]",
                  params: { therapistId: String(item.id) },
                })
              }
            />
          )}
        />
      )}
    </Screen>
  );
}

function TherapistCard({
  therapist,
  onPress,
}: {
  therapist: Therapist;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.identityRow}>
            <Text style={styles.name}>{therapist.name}</Text>
            <Text style={styles.specialty}>{therapist.specialty}</Text>
          </View>
          <StatusBadge
            status={
              therapist.upcoming_slots_count > 0 ? "confirmed" : "pending"
            }
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
                : "Soon"}
            </Text>
          </View>
        </View>
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
    height: 14,
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
  identityRow: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: "#F5F7FA",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  specialty: {
    color: "#9FE2FF",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  bio: {
    marginTop: 14,
    color: "#D2DEEA",
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    marginTop: 16,
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
});
