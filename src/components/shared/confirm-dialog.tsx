import { Modal, View, Text, TouchableOpacity, type ViewStyle } from "react-native";

import { Colors } from "@/src/constants/colors";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog.
 * Per StitchBrief: semi-transparent backdrop, white card centered,
 * 14px radius, 20px padding. Destructive actions use red filled button,
 * never a red filled button for non-destructive.
 */
export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(28, 15, 46, 0.5)" }}
      >
        <View
          className="w-full max-w-sm bg-white p-5"
          style={{
            borderRadius: 14,
            padding: 20,
          } as ViewStyle}
        >
          <Text
            className="text-base font-medium mb-1"
            style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: "500" }}
          >
            {title}
          </Text>
          <Text
            className="mb-5"
            style={{ color: Colors.textSecondary, fontSize: 14 }}
          >
            {description}
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 items-center justify-center py-3"
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: Colors.plum,
              }}
            >
              <Text
                style={{ color: Colors.plum, fontSize: 14, fontWeight: "500" }}
              >
                {cancelLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 items-center justify-center py-3"
              style={{
                borderRadius: 10,
                backgroundColor: destructive ? Colors.expense : Colors.plum,
              }}
            >
              <Text
                style={{ color: Colors.surface, fontSize: 14, fontWeight: "500" }}
              >
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
