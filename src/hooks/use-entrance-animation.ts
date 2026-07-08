import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

/**
 * Returns animated style for a staggered fade-in + slide-up entrance.
 *
 * Usage:
 *   const animStyle = useStaggeredEntrance(index);
 *   <Animated.View style={[animStyle, ...]}>
 *
 * Each item starts at opacity 0, translateY 12px, and animates in
 * with a delay proportional to its index (60ms per item).
 */
export function useStaggeredEntrance(index: number, enabled = true) {
  const opacity = useSharedValue(enabled ? 0 : 1);
  const translateY = useSharedValue(enabled ? 12 : 0);

  useEffect(() => {
    if (!enabled) return;
    opacity.value = withDelay(index * 60, withTiming(1, { duration: 350 }));
    translateY.value = withDelay(index * 60, withTiming(0, { duration: 350 }));
  }, [opacity, translateY, index, enabled]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

/**
 * Simple scale-down press feedback for tappable cards/buttons.
 *
 * Usage:
 *   const { animStyle, onPressIn, onPressOut } = usePressScale();
 *   <Animated.View style={[animStyle, ...]}>
 *     <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
 */
export function usePressScale(scaleTo = 0.97) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withTiming(scaleTo, { duration: 100 });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return { animStyle, onPressIn, onPressOut };
}
