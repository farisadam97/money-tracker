import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

/**
 * Add Transaction screen placeholder.
 * Full form built in Step 8.
 */
export default function AddTransactionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.parchment }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: insets.top + 12,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            color: Colors.textPrimary,
            fontSize: 16,
            fontWeight: "500",
            marginLeft: 8,
          }}
        >
          Add Transaction
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
          Full form coming in Step 8
        </Text>
      </View>
    </View>
  );
}
