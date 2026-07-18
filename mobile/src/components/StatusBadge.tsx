import { StyleSheet, Text, View } from "react-native";

import type { BookingStatus } from "@/types/api";

type StatusBadgeProps = {
  status: BookingStatus | string;
};

const STATUS_STYLES: Record<
  string,
  { backgroundColor: string; color: string }
> = {
  pending: { backgroundColor: "rgba(109, 208, 255, 0.16)", color: "#9FE2FF" },
  confirmed: { backgroundColor: "rgba(108, 214, 156, 0.16)", color: "#AEECC8" },
  failed: { backgroundColor: "rgba(255, 106, 106, 0.16)", color: "#FFB1B1" },
  cancelled: { backgroundColor: "rgba(255, 106, 106, 0.16)", color: "#FFB1B1" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <View style={[styles.badge, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.label, { color: theme.color }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
