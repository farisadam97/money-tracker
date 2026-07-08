import { useEffect } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { AlertCircle, CheckCircle2, X } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { Colors } from "@/src/constants/colors";

type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * Top-of-screen toast notification.
 * Per StitchBrief: auto-dismiss 3s. Success = income green, Error = expense red.
 * Soft muted background with white icon circle, bold title, and close button.
 * Slides down from top on enter, slides up on exit.
 */
export function Toast({
  message,
  variant = "success",
  visible,
  onDismiss,
  durationMs = 3000,
}: ToastProps) {
  const { width } = useWindowDimensions();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
      const timer = setTimeout(onDismiss, durationMs);
      return () => clearTimeout(timer);
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(-120, { duration: 200 });
    }
  }, [visible, onDismiss, durationMs, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const isSuccess = variant === "success";
  const accent = isSuccess ? Colors.income : Colors.expense;
  const bg = isSuccess ? Colors.incomeTint : Colors.expenseTint;
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;
  const title = isSuccess ? "Success" : "Something went wrong";

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        width,
        paddingHorizontal: 16,
        paddingTop: 48,
      }}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          animStyle,
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: bg,
            borderRadius: 16,
            paddingVertical: 14,
            paddingRight: 12,
            paddingLeft: 12,
            shadowColor: "#1C0F2E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 4,
          },
        ]}
      >
        {/* White icon circle */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: Colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon size={20} color={accent} strokeWidth={2.5} />
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: Colors.textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 1,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={{
              color: Colors.textSecondary,
              fontSize: 12,
            }}
            numberOfLines={2}
          >
            {message}
          </Text>
        </View>

        {/* Close button */}
        <Pressable
          onPress={onDismiss}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "rgba(28, 15, 46, 0.05)",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
          }}
        >
          <X size={14} color={Colors.textSecondary} strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
