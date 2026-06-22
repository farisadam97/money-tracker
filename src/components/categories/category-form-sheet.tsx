import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Pressable } from "react-native";
import { Check, Trash2 } from "lucide-react-native";

import { Colors } from "@/src/constants/colors";
import { CATEGORY_COLOR_PALETTE } from "@/src/constants/color-palette";
import { AVAILABLE_ICONS, resolveIcon, DEFAULT_ICON } from "@/src/constants/icon-map";
import { getCategoryColors } from "@/src/constants/categories";
import { ConfirmDialog } from "@/src/components/shared/confirm-dialog";
import type { CategoryInsert, CategoryRow } from "@/src/types/database";

interface CategoryFormSheetProps {
  visible: boolean;
  category?: CategoryRow | null; // null = create mode, present = edit mode
  onSave: (data: { name: string; icon: string; color: string }) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const isAddButton = null;

export function CategoryFormSheet({
  visible,
  category,
  onSave,
  onDelete,
  onClose,
}: CategoryFormSheetProps) {
  const isEdit = !!category;
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState<string>(CATEGORY_COLOR_PALETTE[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(category?.name ?? "");
      setIcon(category?.icon ?? DEFAULT_ICON);
      setColor(category?.color ?? CATEGORY_COLOR_PALETTE[0]);
    }
  }, [visible, category]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color });
  };

  const colors = getCategoryColors(name || "Other");
  const SelectedIcon = resolveIcon(icon);

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <Pressable style={{ flex: 1 }} onPress={onClose}>
          <View style={{ flex: 1, justifyContent: "flex-end" }} />
        </Pressable>
        <View
          style={{
            backgroundColor: Colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "85%",
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: Colors.border,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          {/* Title */}
          <Text
            style={{
              color: Colors.textPrimary,
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 20,
            }}
          >
            {isEdit ? "Edit Category" : "New Category"}
          </Text>

          {/* Preview */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SelectedIcon size={28} color={color} strokeWidth={2} />
            </View>
            <Text style={{ color: Colors.textPrimary, fontSize: 14, marginTop: 8 }}>
              {name || "Category name"}
            </Text>
          </View>

          {/* Name input */}
          <Text style={{ color: Colors.textSecondary, fontSize: 12, marginBottom: 6 }}>
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoFocus
            placeholder="e.g. Coffee"
            placeholderTextColor={Colors.textSecondary}
            style={{
              borderWidth: 0.5,
              borderColor: Colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              color: Colors.textPrimary,
              marginBottom: 16,
            }}
          />

          {/* Icon picker */}
          <Text style={{ color: Colors.textSecondary, fontSize: 12, marginBottom: 6 }}>
            Icon
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {AVAILABLE_ICONS.map((iconName) => {
              const Icon = resolveIcon(iconName);
              const selected = icon === iconName;
              return (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => setIcon(iconName)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    marginRight: 8,
                    backgroundColor: selected ? Colors.plumTint : Colors.parchment,
                    borderWidth: selected ? 1.5 : 0,
                    borderColor: selected ? Colors.plum : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    size={20}
                    color={selected ? Colors.plum : Colors.textSecondary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Color picker */}
          <Text style={{ color: Colors.textSecondary, fontSize: 12, marginBottom: 6 }}>
            Color
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            {CATEGORY_COLOR_PALETTE.map((c) => {
              const selected = color === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: c,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selected ? <Check size={14} color={Colors.surface} strokeWidth={3} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Delete button (edit mode only) */}
          {isEdit && onDelete ? (
            <TouchableOpacity
              onPress={() => setShowDeleteConfirm(true)}
              style={{
                borderWidth: 0.5,
                borderColor: Colors.expense,
                borderRadius: 10,
                padding: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: Colors.expense, fontSize: 14, fontWeight: "500" }}>
                Delete Category
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Action buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: Colors.plum,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: Colors.plum, fontSize: 14, fontWeight: "500" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim()}
              style={{
                flex: 1,
                backgroundColor: Colors.plum,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                opacity: name.trim() ? 1 : 0.5,
              }}
            >
              <Text style={{ color: Colors.surface, fontSize: 14, fontWeight: "500" }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete category?"
        description="This will remove the category. Transactions using it will need to be re-categorized."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (category) onDelete?.(category.id);
          setShowDeleteConfirm(false);
          onClose();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

// Avoid unused import lint
void isAddButton;
