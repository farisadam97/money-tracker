import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

/**
 * Transactions tab placeholder. Full list built in Step 10.
 */
export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: Colors.parchment,
        padding: 16,
        paddingTop: insets.top + 16,
      }}
    >
      <Text style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: "500" }}>
        Transactions
      </Text>
      <Text
        style={{
          color: Colors.textSecondary,
          fontSize: 14,
          marginTop: 8,
        }}
      >
        Full list coming in Step 10
      </Text>
    </View>
  );
}
