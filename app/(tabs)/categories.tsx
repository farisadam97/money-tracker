import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

/**
 * Categories tab placeholder. Full CRUD built in Step 7.
 */
export default function CategoriesScreen() {
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
        Categories
      </Text>
      <Text
        style={{
          color: Colors.textSecondary,
          fontSize: 14,
          marginTop: 8,
        }}
      >
        Category management coming in Step 7
      </Text>
    </View>
  );
}
