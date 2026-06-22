import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

import { AuthProvider } from "@/src/contexts/auth-context";
import { QueryProvider } from "@/src/providers/query-provider";
import { SyncProvider } from "@/src/providers/sync-provider";

export const unstable_settings = {
  anchor: "splash",
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryProvider>
        <SyncProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#FAF7F5" },
            }}
          >
            <Stack.Screen name="splash" />
            <Stack.Screen name="login" />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen
              name="add-transaction"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="dark" />
        </SyncProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
