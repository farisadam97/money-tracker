import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "@/src/constants/colors";

interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  className?: string;
}

/**
 * Animated skeleton loading bars.
 * Per StitchBrief: gray animated bars in #EAE3F0, not spinners.
 * Uses a pulse/opacity shimmer loop via react-native-reanimated.
 */
export function SkeletonLoader({
  count = 3,
  height = 16,
  className = "",
}: SkeletonLoaderProps) {
  return (
    <View className={`w-full ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBar key={i} height={height} delay={i * 150} />
      ))}
    </View>
  );
}

function SkeletonBar({ height, delay }: { height: number; delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Staggered start so bars pulse in sequence
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1, // infinite
        true // reverse (bounce back)
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [opacity, delay]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          height,
          backgroundColor: Colors.border,
          borderRadius: 4,
          marginBottom: 8,
        },
      ]}
    />
  );
}
