import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { PencilLine, Trash2, type LucideIcon } from "lucide-react-native";

import { getCategoryColors } from "@/src/constants/categories";
import { Colors } from "@/src/constants/colors";
import { resolveIcon } from "@/src/constants/icon-map";
import { ConfirmDialog } from "@/src/components/shared/confirm-dialog";
import type { TransactionRow } from "@/src/types/database";

export interface TransactionDetailCategory {
  name: string;
  icon?: string;
  color?: string;
}

interface TransactionDetailSheetProps {
  visible: boolean;
  transaction: TransactionRow | null;
  category?: TransactionDetailCategory | null;
  onClose: () => void;
  onEdit?: (transaction: TransactionRow) => void;
  onDelete?: (id: string) => void;
}

/**
 * Bottom sheet showing full transaction detail.
 *
 * Per PRD §5.3 / StitchBrief: category icon circle (52px) centered,
 * amount 32px colored by type, type badge, divider, detail rows
 * (Date, Time, Note, Source), then Edit and Delete buttons.
 *
 * Edit → caller navigates to Add Transaction screen prefilled.
 * Delete → shows ConfirmDialog (destructive), then calls onDelete.
 */
export function TransactionDetailSheet({
  visible,
  transaction,
  category,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!transaction) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.hidden} />
      </Modal>
    );
  }

  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? Colors.income : Colors.expense;
  const prefix = isIncome ? "+" : "−";

  const categoryName = category?.name ?? "Other";
  const categoryColors = getCategoryColors(categoryName);
  const Icon: LucideIcon = resolveIcon(category?.icon ?? "Tag");
  const iconColor = category?.color ?? categoryColors.icon;

  const dateObj = new Date(transaction.date + "T00:00:00");
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLabel = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const sourceLabel = formatSource(transaction.source);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <BlurView
            intensity={25}
            tint="dark"
            style={{ flex: 1 }}
          />
        </Pressable>

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Category icon */}
            <View
              style={[styles.iconCircle, { backgroundColor: categoryColors.bg }]}
            >
              <Icon size={24} color={iconColor} strokeWidth={2} />
            </View>
            <Text style={styles.categoryName}>{categoryName}</Text>

            {/* Amount */}
            <Text style={[styles.amount, { color: amountColor }]}>
              {prefix}
              {formatCurrency(Number(transaction.amount), transaction.currency)}
            </Text>

            {/* Type badge */}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isIncome
                    ? Colors.incomeTint
                    : Colors.expenseTint,
                },
              ]}
            >
              <Text
                style={[styles.badgeText, { color: amountColor }]}
              >
                {isIncome ? "Income" : "Expense"}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Detail rows */}
            <DetailRow label="Date" value={dateLabel} />
            <DetailRow label="Time" value={timeLabel} />
            <DetailRow
              label="Note"
              value={transaction.note?.trim() ? transaction.note : "—"}
            />
            <DetailRow label="Source" value={sourceLabel} />
          </ScrollView>

          {/* Edit */}
          <TouchableOpacity
            style={[styles.outlinedButton, { borderColor: Colors.plum }]}
            onPress={() => onEdit?.(transaction)}
            accessibilityRole="button"
            accessibilityLabel="Edit transaction"
          >
            <PencilLine size={16} color={Colors.plum} strokeWidth={2} />
            <Text style={[styles.outlinedButtonText, { color: Colors.plum }]}>
              Edit Transaction
            </Text>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            style={[styles.outlinedButton, { borderColor: Colors.expense }]}
            onPress={() => setShowDeleteConfirm(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete transaction"
          >
            <Trash2 size={16} color={Colors.expense} strokeWidth={2} />
            <Text
              style={[styles.outlinedButtonText, { color: Colors.expense }]}
            >
              Delete Transaction
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete transaction?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          onDelete?.(transaction.id);
          setShowDeleteConfirm(false);
          onClose();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

// --- Detail Row ---

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

// --- Helpers ---

function formatCurrency(amount: number, currency: string): string {
  if (currency === "IDR") {
    return "Rp " + amount.toLocaleString("id-ID");
  }
  // Fallback: use Intl if available, else plain number with code prefix
  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount)
    );
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

function formatSource(source: string): string {
  switch (source) {
    case "manual":
      return "Manual entry";
    case "email":
      return "Email import";
    case "split_bill":
      return "Split bill";
    default:
      return source;
  }
}

// --- Styles ---

const styles = StyleSheet.create({
  hidden: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  categoryName: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },
  badge: {
    alignSelf: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  detailValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  outlinedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  outlinedButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
