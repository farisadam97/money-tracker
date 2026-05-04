import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-parchment">
      <Text className="text-screen-title text-plum font-medium">
        MoneyTracker
      </Text>
      <Text className="text-secondary text-text-secondary mt-2">
        NativeWind is configured!
      </Text>
    </View>
  );
}
