import { View, Text, ActivityIndicator } from "react-native";
import { Wallet } from "lucide-react-native";
import { Redirect } from "expo-router";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/use-auth";

/**
 * Splash screen — shown while app checks for existing auth session.
 * Auto-redirects to login or main app based on session state.
 */
export default function SplashScreen() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.parchment }}
      >
        {/* Placeholder logo — replace with actual app logo asset */}
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
        <Text
          style={{ color: Colors.plum, fontSize: 24, fontWeight: "500" }}
        >
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

  // Redirect based on session
  return session ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href={"/login" as never} />
  );
}
