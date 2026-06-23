import { PencilLine, Plus, type LucideIcon } from "lucide-react-native";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getCategoryColors } from "@/src/constants/categories";
import { Colors } from "@/src/constants/colors";
import { resolveIcon } from "@/src/constants/icon-map";
import type { CategoryRow } from "@/src/types/database";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16;
const GAP = 10;
// 3 cards per row with gaps between them
export const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP * 2) / 3;
// Rectangular cards — shorter than square to fit more per screen
const CARD_HEIGHT = CARD_WIDTH * 0.72;

interface CategoryCardProps {
  category?: CategoryRow;
  icon?: LucideIcon;
  onPress?: () => void;
  isAddCard?: boolean;
  isEditable?: boolean;
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
  const IconComponent = iconProp ?? resolveIcon(category?.icon ?? "Tag");

  // Add category card — dashed border
  if (isAddCard) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.card, styles.addCard]}>
        <Plus size={20} color={Colors.textSecondary} strokeWidth={2} />
        <Text style={styles.addText}>Add Category</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {/* Colored circle avatar */}
      <View style={styles.avatar}>
        <IconComponent size={20} color={colors.icon} strokeWidth={2} />
      </View>
      <Text style={styles.cardName} numberOfLines={2}>
        {categoryName}
      </Text>

      {/* Edit pencil for user categories */}
      {isEditable ? (
        <View style={styles.editBadge}>
          <PencilLine size={10} color={Colors.textSecondary} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  addCard: {
    backgroundColor: Colors.parchment,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  addText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    color: Colors.textPrimary,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 14,
  },
  editBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
  },
});
