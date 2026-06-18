import { useEffect } from "react";
import { View, Text, useWindowDimensions } from "react-native";

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
 * Bottom-of-screen toast notification.
 * Per StitchBrief: auto-dismiss 3s. Success = income green, Error = expense red.
 */
export function Toast({
  message,
  variant = "success",
  visible,
  onDismiss,
  durationMs = 3000,
}: ToastProps) {
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [visible, onDismiss, durationMs]);

  if (!visible) return null;

  const bg = variant === "success" ? Colors.income : Colors.expense;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-4 pb-6"
      pointerEvents="none"
      style={{ width }}
    >
      <View
        className="px-4 py-3 rounded-lg"
        style={{ backgroundColor: bg }}
      >
        <Text
          className="text-center"
          style={{ color: Colors.surface, fontSize: 14, fontWeight: "500" }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
