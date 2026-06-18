import { View, Text, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/src/constants/colors";
import { useUserPreferencesStore } from "@/src/stores/user-preferences-store";

/**
 * Onboarding Screen 3 — Manual Entry Intro
 *
 * Final onboarding screen. Marks onboarding as complete in user-preferences-store,
 * then redirects to the main app (bottom tabs).
 */
export default function ManualEntryScreen() {
  const router = useRouter();
  const setOnboardingComplete = useUserPreferencesStore(
    (s) => s.setOnboardingComplete
  );

  const handleGoToDashboard = () => {
    setOnboardingComplete(true);
    router.replace("/(tabs)");
  };

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: Colors.parchment }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: Colors.tangerineTint,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Plus size={40} color={Colors.tangerine} strokeWidth={2.5} />
      </View>

      <Text
        style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: "500", textAlign: "center" }}
      >
        You can always add transactions manually
      </Text>
      <Text
        style={{
          color: Colors.textSecondary,
          fontSize: 14,
          marginTop: 8,
          textAlign: "center",
          maxWidth: 280,
          lineHeight: 20,
        }}
      >
        Tap the + button anytime to record cash or any transaction
      </Text>

      <TouchableOpacity
        onPress={handleGoToDashboard}
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
          Go to Dashboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}
