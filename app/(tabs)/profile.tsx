import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/use-auth";

/**
 * Profile tab placeholder. Full profile built in Step 11.
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    signOut();
    router.replace("/login" as never);
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: Colors.parchment,
        padding: 16,
        paddingTop: insets.top + 16,
      }}
    >
      {/* User card */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderWidth: 0.5,
          borderColor: Colors.border,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: "500" }}>
          {user?.user_metadata?.full_name ?? user?.email ?? "User"}
        </Text>
        <Text style={{ color: Colors.textSecondary, fontSize: 13, marginTop: 2 }}>
          {user?.email}
        </Text>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{
          borderWidth: 0.5,
          borderColor: Colors.expense,
          borderRadius: 10,
          padding: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: Colors.expense, fontSize: 14, fontWeight: "500" }}>
          Sign Out
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: Colors.textSecondary,
          fontSize: 11,
          textAlign: "center",
          marginTop: 40,
        }}
      >
        Full profile coming in Step 11
      </Text>
    </View>
  );
}
