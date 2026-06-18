import { View } from "react-native";

import { Colors } from "@/src/constants/colors";

interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  className?: string;
}

/**
 * Animated skeleton loading bars.
 * Per StitchBrief: gray animated bars in #EAE3F0, not spinners.
 */
export function SkeletonLoader({
  count = 3,
  height = 16,
  className = "",
}: SkeletonLoaderProps) {
  return (
    <View className={`w-full ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="w-full mb-2"
          style={{
            height,
            backgroundColor: Colors.border,
            borderRadius: 4,
            opacity: 0.6,
          }}
        />
      ))}
    </View>
  );
}
