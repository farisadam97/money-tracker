import { useRouter } from "expo-router";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfirmDialog } from "@/src/components/shared/confirm-dialog";
import { Toast } from "@/src/components/shared/toast";
import { getCategoryColors } from "@/src/constants/categories";
import { Colors } from "@/src/constants/colors";
import { resolveIcon } from "@/src/constants/icon-map";
import { useAuth } from "@/src/hooks/use-auth";
import { useCategoriesQuery } from "@/src/hooks/use-categories";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/src/hooks/use-transactions";
import { useUserPreferencesStore } from "@/src/stores/user-preferences-store";
import type {
  CategoryRow,
  TransactionRow,
  TransactionType,
} from "@/src/types/database";

interface AddTransactionProps {
  // Edit mode: pass existing transaction
  transaction?: TransactionRow;
}

export default function AddTransactionScreen({
  transaction,
}: AddTransactionProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const defaultCurrency = useUserPreferencesStore((s) => s.defaultCurrency);

  const isEdit = !!transaction;
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const { data: categories } = useCategoriesQuery();

  // Form state
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense",
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(
    null, // Will be set from transaction in edit mode, or via picker
  );
  const [date, setDate] = useState(
    transaction?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [currency, setCurrency] = useState(
    transaction?.currency ?? defaultCurrency,
  );
  const [note, setNote] = useState(transaction?.note ?? "");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success",
  );
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (
    message: string,
    variant: "success" | "error" = "success",
  ) => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  // Find category from transaction in edit mode
  useState(() => {
    if (transaction && categories) {
      const cat = categories.find((c) => c.id === transaction.category_id);
      if (cat) setSelectedCategory(cat);
    }
  });

  const canSave = parseFloat(amount) > 0 && selectedCategory !== null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!canSave || !user) return;

    const payload = {
      user_id: user.id,
      amount: parseFloat(amount),
      currency,
      category_id: selectedCategory!.id,
      type,
      note: note.trim() || null,
      date,
      source: "manual" as const,
    };

    try {
      if (isEdit && transaction) {
        await updateMutation.mutateAsync({ id: transaction.id, ...payload });
        showToast("Transaction updated");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Transaction saved");
      }
      setTimeout(() => router.back(), 800);
    } catch {
      showToast("Failed to save", "error");
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    try {
      await deleteMutation.mutateAsync(transaction.id);
      showToast("Transaction deleted");
      setTimeout(() => router.back(), 800);
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <ChevronLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Transaction" : "Add Transaction"}
        </Text>
        {isEdit ? (
          <TouchableOpacity
            onPress={() => setShowDeleteConfirm(true)}
            style={styles.headerButton}
          >
            <Trash2 size={20} color={Colors.expense} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>Rp</Text>
          <TextInput
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            autoFocus={!isEdit}
            style={styles.amountInput}
          />
        </View>

        {/* Income/Expense toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setType("expense")}
            style={[
              styles.toggleButton,
              type === "expense" && styles.toggleActiveExpense,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                type === "expense" && styles.toggleTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType("income")}
            style={[
              styles.toggleButton,
              type === "income" && styles.toggleActiveIncome,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                type === "income" && styles.toggleTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form rows */}
        <View style={styles.formSection}>
          {/* Category row */}
          <FormRow
            icon={selectedCategory ? resolveIcon(selectedCategory.icon) : Check}
            iconBg={
              selectedCategory
                ? getCategoryColors(selectedCategory.name).bg
                : Colors.plumTint
            }
            iconColor={
              selectedCategory
                ? getCategoryColors(selectedCategory.name).icon
                : Colors.plum
            }
            label="Category"
            value={selectedCategory?.name ?? "Select"}
            valueColor={
              selectedCategory ? Colors.textPrimary : Colors.textSecondary
            }
            onPress={() => setShowCategoryPicker(true)}
          />

          {/* Date row */}
          <FormRow
            icon={CalendarDays}
            iconBg={Colors.plumTint}
            iconColor={Colors.plum}
            label="Date"
            value={formatDate(date)}
            onPress={() => {
              // Simplified: for Phase 1, just use today. Date picker in Phase 1.5.
              // Native date picker requires modal setup.
            }}
          />

          {/* Currency row */}
          <FormRow
            icon={Globe}
            iconBg={Colors.plumTint}
            iconColor={Colors.plum}
            label="Currency"
            value={currency}
            onPress={() => {
              // Simplified: use default currency. Full picker in Phase 1.5.
            }}
          />

          {/* Note row */}
          <View style={styles.noteRow}>
            <View
              style={[styles.rowIcon, { backgroundColor: Colors.plumTint }]}
            >
              <FileText size={14} color={Colors.plum} />
            </View>
            <View style={styles.noteInputContainer}>
              <Text style={styles.noteLabel}>Note</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add a note (optional)"
                placeholderTextColor={Colors.textSecondary}
                multiline
                style={styles.noteInput}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View
        style={[styles.saveContainer, { paddingBottom: insets.bottom + 16 }]}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave || isSaving}
          style={[
            styles.saveButton,
            (!canSave || isSaving) && styles.saveButtonDisabled,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Transaction"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Picker Modal */}
      {showCategoryPicker ? (
        <CategoryPickerModal
          categories={categories ?? []}
          selectedId={selectedCategory?.id}
          onSelect={(cat) => {
            setSelectedCategory(cat);
            setShowCategoryPicker(false);
          }}
          onClose={() => setShowCategoryPicker(false)}
        />
      ) : null}

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete transaction?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Toast */}
      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

// --- Form Row Component ---

function FormRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  onPress,
}: {
  icon: typeof ChevronLeft;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  valueColor?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.formRow}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Icon size={14} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[styles.rowValue, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>
      {onPress ? <ChevronRight size={16} color={Colors.textSecondary} /> : null}
    </TouchableOpacity>
  );
}

// --- Category Picker ---

function CategoryPickerModal({
  categories,
  selectedId,
  onSelect,
  onClose,
}: {
  categories: CategoryRow[];
  selectedId?: string;
  onSelect: (cat: CategoryRow) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const master = categories.filter((c) => c.user_id === null);
  const userCats = categories.filter((c) => c.user_id !== null);

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: Colors.parchment }]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <ChevronLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Category</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Default categories */}
        {master.length > 0 ? (
          <CategorySection
            title="DEFAULT CATEGORIES"
            cats={master}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ) : null}

        {/* User categories */}
        {userCats.length > 0 ? (
          <CategorySection
            title="MY CATEGORIES"
            cats={userCats}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function CategorySection({
  title,
  cats,
  selectedId,
  onSelect,
}: {
  title: string;
  cats: CategoryRow[];
  selectedId?: string;
  onSelect: (cat: CategoryRow) => void;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.pickerGrid}>
        {cats.map((cat) => {
          const colors = getCategoryColors(cat.name);
          const Icon = resolveIcon(cat.icon);
          const selected = cat.id === selectedId;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSelect(cat)}
              style={[styles.pickerCard, selected && styles.pickerCardSelected]}
            >
              <View
                style={[styles.pickerAvatar, { backgroundColor: colors.bg }]}
              >
                <Icon size={20} color={colors.icon} strokeWidth={2} />
              </View>
              <Text style={styles.pickerName} numberOfLines={2}>
                {cat.name}
              </Text>
              {selected ? (
                <View style={styles.pickerCheckmark}>
                  <Check size={12} color={Colors.surface} strokeWidth={3} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// --- Helpers ---

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parchment,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    paddingVertical: 20,
  },
  currencySymbol: {
    color: Colors.textSecondary,
    fontSize: 24,
    marginRight: 8,
  },
  amountInput: {
    color: Colors.textPrimary,
    fontSize: 48,
    fontWeight: "500",
    minWidth: 120,
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.border,
    borderRadius: 10,
    padding: 3,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleActiveExpense: {
    backgroundColor: Colors.expense,
  },
  toggleActiveIncome: {
    backgroundColor: Colors.income,
  },
  toggleText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  toggleTextActive: {
    color: Colors.surface,
  },
  formSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  rowValue: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  noteInputContainer: {
    flex: 1,
  },
  noteLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  noteInput: {
    color: Colors.textSecondary,
    fontSize: 14,
    minHeight: 40,
    paddingTop: 0,
  },
  saveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.parchment,
  },
  saveButton: {
    backgroundColor: Colors.plum,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: Colors.border,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: "500",
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 12,
    marginTop: 16,
  },
  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickerCard: {
    width: ((100 - 10 * 2) / 3 + "%") as unknown as number,
    aspectRatio: 0.72,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    position: "relative",
  },
  pickerCardSelected: {
    borderWidth: 2,
    borderColor: Colors.plum,
  },
  pickerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerName: {
    color: Colors.textPrimary,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  pickerCheckmark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.plum,
    alignItems: "center",
    justifyContent: "center",
  },
});
