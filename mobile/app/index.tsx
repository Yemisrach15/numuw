import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { Screen } from "@/components/Screen";
import { useAuth } from "@/providers/AuthProvider";

export default function IndexRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Screen>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#6DD0FF" />
        </View>
      </Screen>
    );
  }

  return <Redirect href={user ? "/(app)/therapists" : "/(auth)"} />;
}
