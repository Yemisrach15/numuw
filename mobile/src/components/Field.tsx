import { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

type FieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, error, style, ...props },
  ref,
) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor="#6B7A90"
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    color: "#D8E3F0",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    color: "#F5F7FA",
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: "rgba(255, 106, 106, 0.8)",
  },
  error: {
    color: "#FF8B8B",
    fontSize: 13,
  },
});
