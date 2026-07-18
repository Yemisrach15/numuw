import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6DD0FF",
        tabBarInactiveTintColor: "#6B7A90",
        tabBarStyle: {
          backgroundColor: "#08111D",
          borderTopColor: "rgba(255, 255, 255, 0.08)",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen name="therapists" options={{ title: "Therapists" }} />
      <Tabs.Screen name="bookings" options={{ title: "My bookings" }} />
    </Tabs>
  );
}
