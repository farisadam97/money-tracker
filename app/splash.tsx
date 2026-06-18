import { View, Text, ActivityIndicator } from "react-native";
import { Wallet } from "lucide-react-native";
import { Redirect } from "expo-router";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/use-auth";
import { useUserPreferencesStore } from "@/src/stores/user-preferences-store";

/**
 * Splash screen — shown while app checks for existing auth session.
 *
 * Routing priority:
 * 1. Loading → show splash
 * 2. No session → login
 * 3. Session + onboarding not complete → onboarding/welcome
 * 4. Session + onboarding complete → main app (tabs)
 */
export default function SplashScreen() {
  const { session, isLoading } = useAuth();
  const onboardingComplete = useUserPreferencesStore(
    (s) => s.onboardingComplete
  );

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.parchment }}
      >
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            backgroundColor: Colors.plum,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Wallet size={48} color={Colors.surface} strokeWidth={2} />
        </View>
        <Text style={{ color: Colors.plum, fontSize: 24, fontWeight: "500" }}>
          MoneyTracker
        </Text>
        <Text
          style={{ color: Colors.textSecondary, fontSize: 14, marginTop: 4 }}
        >
          Track smart, spend wise
        </Text>
        <ActivityIndicator
          color={Colors.plum}
          size="small"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  if (!session) {
    return <Redirect href={"/login" as never} />;
  }

  if (!onboardingComplete) {
    return <Redirect href={"/onboarding/welcome" as never} />;
  }

  return <Redirect href="/(tabs)" />;
}
