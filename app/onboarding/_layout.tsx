import { Stack } from "expo-router";

import { Colors } from "@/src/constants/colors";

/**
 * Layout for onboarding screens.
 * No headers, light mode, parchment background per PRD §5.2.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.parchment },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auto-import-teaser" />
      <Stack.Screen name="manual-entry" />
    </Stack>
  );
}
