import { View, Text, TouchableOpacity } from "react-native";
import { Mail, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/src/constants/colors";

/**
 * Onboarding Screen 2 — Auto-Import Teaser
 *
 * Per AR-4 decision: NO intake address, NO keyword form, NO Gmail guide.
 * Just awareness that the feature exists, with a pointer to Profile.
 *
 * The full setup (intake address, keywords, Gmail filter guide) moves to
 * Profile → Transaction Import in Phase 2.5 when the backend exists.
 */
export default function AutoImportTeaserScreen() {
  const router = useRouter();

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: Colors.parchment }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: Colors.plumTint,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Mail size={40} color={Colors.plum} strokeWidth={2} />
      </View>

      <Text
        style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: "500", textAlign: "center" }}
      >
        Track automatically, too
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
        You can forward bank or e-wallet receipts and we'll log them for you.
        Set it up anytime in Profile.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/onboarding/manual-entry" as never)}
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
          Sounds good
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/onboarding/manual-entry" as never)}
        className="mt-4 flex-row items-center"
      >
        <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
          Skip for now
        </Text>
        <ChevronRight size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
