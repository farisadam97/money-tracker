import { type ReactNode, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

/**
 * Screen-level entrance animation for tab screens.
 *
 * Fades in + slides up 16px every time the tab gains focus.
 * Wrap each tab screen's root:
 *   <ScreenEntrance>
 *     <MyScreenContent />
 *   </ScreenEntrance>
 */
export function ScreenEntrance({ children }: { children: ReactNode }) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (isFocused) {
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Reset so it re-animates next time the tab is selected
      opacity.value = 0;
      translateY.value = 16;
    }
  }, [isFocused, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animStyle]}>
      {children}
    </Animated.View>
  );
}
