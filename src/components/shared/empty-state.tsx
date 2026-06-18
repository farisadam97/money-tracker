import { View, Text, TouchableOpacity } from "react-native";
import { type LucideIcon } from "lucide-react-native";

import { Colors } from "@/src/constants/colors";

interface EmptyStateProps {
  icon: LucideIcon;
  iconSize?: number;
  heading: string;
  subtext?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

/**
 * Reusable empty state for lists.
 * Per StitchBrief: simple icon + heading + optional subtext + optional plum CTA.
 */
export function EmptyState({
  icon: Icon,
  iconSize = 48,
  heading,
  subtext,
  ctaLabel,
  onCtaPress,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Icon size={iconSize} color={Colors.textSecondary} strokeWidth={1.5} />
      <Text
        className="mt-4 text-center"
        style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: "500" }}
      >
        {heading}
      </Text>
      {subtext ? (
        <Text
          className="mt-1 text-center"
          style={{ color: Colors.textSecondary, fontSize: 14 }}
        >
          {subtext}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <TouchableOpacity
          onPress={onCtaPress}
          className="mt-5 px-6 py-3"
          style={{
            backgroundColor: Colors.plum,
            borderRadius: 10,
          }}
        >
          <Text
            style={{ color: Colors.surface, fontSize: 14, fontWeight: "500" }}
          >
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
