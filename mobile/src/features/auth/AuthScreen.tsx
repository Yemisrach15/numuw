import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { Screen } from "@/components/Screen";
import { hasFirebaseConfig } from "@/config/env";
import { useAuth } from "@/providers/AuthProvider";

type Mode = "signIn" | "signUp";

export function AuthScreen() {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/(app)/therapists");
    }
  }, [router, user]);

  const title = mode === "signIn" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "signIn"
      ? "Sign in to browse therapists, reserve a slot, and watch the booking move to confirmed in real time."
      : "Create a parent account so you can book an appointment with a Firebase email/password session.";

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      if (mode === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Authentication failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!hasFirebaseConfig) {
    return (
      <Screen scroll contentContainerStyle={styles.centered}>
        <Card>
          <Text style={styles.title}>Firebase not configured</Text>
          <Text style={styles.subtitle}>
            Set the Firebase values in{" "}
            <Text style={styles.inlineCode}>.env</Text> or in the Expo app
            config before using sign in or sign up.
          </Text>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Required keys: API key, auth domain, project ID, app ID, and
              optional bucket/sender values.
            </Text>
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll contentContainerStyle={styles.centered}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Numuw parent client</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.segmentedRow}>
          <Button
            label="Sign in"
            tone={mode === "signIn" ? "primary" : "secondary"}
            onPress={() => setMode("signIn")}
            style={styles.segmentButton}
          />
          <Button
            label="Sign up"
            tone={mode === "signUp" ? "primary" : "secondary"}
            onPress={() => setMode("signUp")}
            style={styles.segmentButton}
          />
        </View>

        <Field
          label="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Field
          label="Password"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={mode === "signIn" ? "Sign in" : "Create account"}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />

        <Text style={styles.helperText}>
          Booking requests are created with Firebase auth, then confirmed in the
          backend and streamed back over websocket.
        </Text>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Use the same email/password for both sign in and sign up flows.
        </Text>
        {loading ? <ActivityIndicator color="#6DD0FF" /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
  },
  hero: {
    marginBottom: 18,
    gap: 10,
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
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: "#B3C4D8",
    fontSize: 15,
    lineHeight: 22,
  },
  inlineCode: {
    color: "#D4E8FF",
    fontWeight: "700",
  },
  formCard: {
    gap: 16,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 10,
  },
  segmentButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: 4,
  },
  error: {
    color: "#FF8B8B",
    fontSize: 14,
    lineHeight: 20,
  },
  helperText: {
    color: "#90A2B8",
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    marginTop: 16,
    gap: 10,
    alignItems: "center",
  },
  footerText: {
    color: "#7386A0",
    textAlign: "center",
    fontSize: 12,
  },
  notice: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "rgba(255, 120, 120, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 120, 120, 0.15)",
  },
  noticeText: {
    color: "#FFB6B6",
    lineHeight: 20,
  },
});
