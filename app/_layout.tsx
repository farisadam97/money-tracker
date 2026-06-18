import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "@/src/contexts/auth-context";
import { QueryProvider } from "@/src/providers/query-provider";

export const unstable_settings = {
  anchor: "splash",
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FAF7F5" },
          }}
        >
          <Stack.Screen name="splash" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </QueryProvider>
    </AuthProvider>
  );
}
