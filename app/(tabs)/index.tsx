import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/use-auth";

/**
 * Home tab placeholder. Full dashboard built in Step 9.
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <ScrollView
      className="flex-1"
      style={{
        backgroundColor: Colors.parchment,
        paddingTop: insets.top + 16,
      }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
        Good day,
      </Text>
      <Text
        style={{
          color: Colors.textPrimary,
          fontSize: 18,
          fontWeight: "500",
          marginBottom: 24,
        }}
      >
        {firstName}
      </Text>

      <View
        style={{
          backgroundColor: Colors.plum,
          borderRadius: 14,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            fontWeight: "500",
            letterSpacing: 0.5,
          }}
        >
          AVAILABLE BALANCE
        </Text>
        <Text
          style={{
            color: Colors.surface,
            fontSize: 36,
            fontWeight: "500",
            marginTop: 4,
          }}
        >
          Rp0
        </Text>
        <View className="flex-row mt-4 gap-6">
          <View>
            <Text style={{ color: Colors.income, fontSize: 12 }}>
              Income
            </Text>
            <Text style={{ color: Colors.surface, fontSize: 14, fontWeight: "500" }}>
              Rp0
            </Text>
          </View>
          <View>
            <Text style={{ color: Colors.expense, fontSize: 12 }}>
              Expenses
            </Text>
            <Text style={{ color: Colors.surface, fontSize: 14, fontWeight: "500" }}>
              Rp0
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={{
          color: Colors.textSecondary,
          fontSize: 14,
          textAlign: "center",
          marginTop: 40,
        }}
      >
        Dashboard content coming in Step 9
      </Text>
    </ScrollView>
  );
}
