import { View, Text, TouchableOpacity } from "react-native";
import { Wallet } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/src/constants/colors";

/**
 * Onboarding Screen 1 — Welcome
 *
 * Per PRD §5.2 Screen 1 + AR-4 decision.
 * Shown once after first successful login.
 */
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: Colors.parchment }}
    >
      {/* Placeholder logo — replace with actual asset */}
      <View
        style={{
          width: 90,
          height: 90,
          borderRadius: 24,
          backgroundColor: Colors.plum,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Wallet size={48} color={Colors.surface} strokeWidth={2} />
      </View>

      <Text
        style={{ color: Colors.plum, fontSize: 24, fontWeight: "500" }}
      >
        Welcome to MoneyTracker
      </Text>
      <Text
        style={{
          color: Colors.textSecondary,
          fontSize: 14,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        Track your spending automatically or manually
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/onboarding/auto-import-teaser" as never)}
        className="w-full mt-10 py-4 items-center"
        style={{
          backgroundColor: Colors.plum,
          borderRadius: 10,
          maxWidth: 320,
        }}
      >
        <Text
          style={{ color: Colors.surface, fontSize: 14, fontWeight: "500" }}
        >
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
}
