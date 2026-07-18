import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type ButtonTone = "primary" | "secondary" | "ghost";

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  tone?: ButtonTone;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  loading = false,
  tone = "primary",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const labelStyle =
    tone === "primary"
      ? styles.primaryLabel
      : tone === "secondary"
        ? styles.secondaryLabel
        : styles.ghostLabel;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[tone],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={tone === "ghost" ? "#F5F7FA" : "#08111D"} />
      ) : (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    flexDirection: "row",
  },
  primary: {
    backgroundColor: "#6DD0FF",
  },
  secondary: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: "#08111D",
  },
  secondaryLabel: {
    color: "#F5F7FA",
  },
  ghostLabel: {
    color: "#F5F7FA",
  },
});
