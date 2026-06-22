import { View, Text, TouchableOpacity, type ViewStyle } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { Plus, PencilLine } from "lucide-react-native";

import { getCategoryColors } from "@/src/constants/categories";
import { Colors } from "@/src/constants/colors";
import type { CategoryRow } from "@/src/types/database";

interface CategoryCardProps {
  category?: CategoryRow;
  icon?: LucideIcon;
  onPress?: () => void;
  isAddCard?: boolean;
  isEditable?: boolean;
}

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {};

/**
 * Resolves a Lucide icon component from a string name.
 * Falls back to Tag icon if not found.
 */
export function setCategoryIcon(name: string, icon: LucideIcon) {
  CATEGORY_ICON_MAP[name] = icon;
}

export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICON_MAP[name] ?? CATEGORY_ICON_MAP["Tag"]!;
}

export function CategoryCard({
  category,
  icon: iconProp,
  onPress,
  isAddCard = false,
  isEditable = false,
}: CategoryCardProps) {
  const categoryName = category?.name ?? "";
  const colors = getCategoryColors(categoryName);
  const IconComponent = iconProp ?? getCategoryIcon(category?.icon ?? "Tag");

  // Add category card — dashed border
  if (isAddCard) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          flex: 1,
          maxWidth: "33.33%",
          aspectRatio: 1,
          backgroundColor: Colors.parchment,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.border,
          borderStyle: "dashed",
          alignItems: "center",
          justifyContent: "center",
          padding: 14,
        }}
      >
        <Plus size={20} color={Colors.textSecondary} strokeWidth={2} />
        <Text
          style={{
            color: Colors.textSecondary,
            fontSize: 12,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Add Category
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        maxWidth: "33.33%",
        aspectRatio: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: Colors.border,
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        position: "relative",
      } as ViewStyle}
    >
      {/* Colored circle avatar */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconComponent size={20} color={colors.icon} strokeWidth={2} />
      </View>
      <Text
        style={{
          color: Colors.textPrimary,
          fontSize: 12,
          marginTop: 8,
          textAlign: "center",
        }}
        numberOfLines={2}
      >
        {categoryName}
      </Text>

      {/* Edit pencil for user categories */}
      {isEditable ? (
        <View style={{ position: "absolute", bottom: 6, right: 6 }}>
          <PencilLine size={12} color={Colors.textSecondary} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
