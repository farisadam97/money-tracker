import { View } from "react-native";
import { type LucideIcon } from "lucide-react-native";

import { getCategoryColors } from "@/src/constants/categories";

interface CategoryAvatarProps {
  iconName?: string;
  categoryName: string;
  icon?: LucideIcon;
  size?: number;
  customIconColor?: string;
  customBgColor?: string;
  testID?: string;
}

/**
 * Colored circle with Lucide icon centered.
 * Reusable across dashboard, transaction rows, category cards.
 *
 * If a LucideIcon component is passed directly, uses it.
 * Otherwise falls back to a default dot (icon name resolution deferred to
 * a future icon-name-to-component map).
 */
export function CategoryAvatar({
  categoryName,
  icon: IconComponent,
  size = 40,
  customIconColor,
  customBgColor,
  testID,
}: CategoryAvatarProps) {
  const colors = getCategoryColors(categoryName);
  const bgColor = customBgColor ?? colors.bg;
  const iconColor = customIconColor ?? colors.icon;

  return (
    <View
      testID={testID}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {IconComponent ? (
        <IconComponent size={size * 0.5} color={iconColor} strokeWidth={2} />
      ) : null}
    </View>
  );
}
