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
import { CalendarDays, Check, type LucideIcon } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { getCategoryColors } from "@/src/constants/categories";
import { Colors } from "@/src/constants/colors";
import { resolveIcon } from "@/src/constants/icon-map";
import { useCategoriesQuery } from "@/src/hooks/use-categories";
import {
  FILTER_TABS,
  FILTER_TAB_LABELS,
  type FilterTab,
} from "@/src/types/database";
import {
  type FilterType,
  useFilterStore,
} from "@/src/stores/filter-store";
import type { CategoryRow } from "@/src/types/database";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
}

type DatePickerMode = "from" | "to" | null;

/**
 * Filter Bottom Sheet for the Transactions list.
 *
 * Per PRD §5.3 / StitchBrief Screen 7:
 * - Type filter: 3 toggle chips (All / Income / Expense)
 * - Category filter: scrollable grid, multiselect
 * - Date range: From / To date pickers
 * - Apply button with active count
 *
 * Reads/writes the shared Zustand filter store so the quick tabs
 * and active filter chips stay in sync.
 */
export function FilterSheet({ visible, onClose }: FilterSheetProps) {
  const {
    type,
    setType,
    categoryIds,
    toggleCategory,
    clearCategories,
    dateFrom,
    dateTo,
    setDateRange,
    reset,
    activeFilterCount,
  } = useFilterStore();

  const { data: categories } = useCategoriesQuery();
  const [datePickerOpen, setDatePickerOpen] = useState<DatePickerMode>(null);

  const handleReset = () => {
    reset();
  };

  const handleApply = () => {
    onClose();
  };

  const handleDatePick = (_event: unknown, selectedDate?: Date) => {
    if (!selectedDate || !datePickerOpen) {
      setDatePickerOpen(null);
      return;
    }
    const iso = selectedDate.toISOString().slice(0, 10);
    if (datePickerOpen === "from") {
      setDateRange(iso, dateTo);
    } else {
      setDateRange(dateFrom, iso);
    }
    setDatePickerOpen(null);
  };

  const count = activeFilterCount();

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View style={{ flex: 1 }} />
        </Pressable>

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filter Transactions</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {/* Type */}
            <Text style={styles.sectionLabel}>Type</Text>
            <View style={styles.typeRow}>
              {FILTER_TABS.map((tab) => {
                const filterVal = tab as FilterType;
                const isActive = type === filterVal;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setType(filterVal)}
                    style={[
                      styles.typeChip,
                      isActive && styles.typeChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        isActive && styles.typeChipTextActive,
                      ]}
                    >
                      {FILTER_TAB_LABELS[tab as FilterTab]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Categories */}
            <Text style={styles.sectionLabel}>Categories</Text>
            {categoryIds.length > 0 ? (
              <TouchableOpacity onPress={clearCategories}>
                <Text style={styles.clearText}>Clear ({categoryIds.length})</Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.categoryGrid}>
              {(categories ?? []).map((cat) => (
                <CategoryChip
                  key={cat.id}
                  category={cat}
                  selected={categoryIds.includes(cat.id)}
                  onPress={() => toggleCategory(cat.id)}
                />
              ))}
            </View>

            {/* Date range */}
            <Text style={styles.sectionLabel}>Date Range</Text>
            <View style={styles.dateRow}>
              <DateField
                label="From"
                value={dateFrom}
                onPress={() => setDatePickerOpen("from")}
              />
              <DateField
                label="To"
                value={dateTo}
                onPress={() => setDatePickerOpen("to")}
              />
            </View>
          </ScrollView>

          {/* Apply */}
          <TouchableOpacity
            onPress={handleApply}
            style={styles.applyButton}
          >
            <Text style={styles.applyText}>
              {count > 0 ? `Apply (${count} filter${count > 1 ? "s" : ""})` : "Apply Filters"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Date picker */}
      {datePickerOpen !== null ? (
        <DateTimePicker
          value={
            datePickerOpen === "from" && dateFrom
              ? new Date(dateFrom + "T00:00:00")
              : datePickerOpen === "to" && dateTo
                ? new Date(dateTo + "T00:00:00")
                : new Date()
          }
          mode="date"
          display="spinner"
          onChange={handleDatePick}
        />
      ) : null}
    </>
  );
}

// --- Category Chip ---

function CategoryChip({
  category,
  selected,
  onPress,
}: {
  category: CategoryRow;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = getCategoryColors(category.name);
  const Icon: LucideIcon = resolveIcon(category.icon ?? "Tag");

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.categoryChip,
        selected && styles.categoryChipSelected,
      ]}
    >
      <View style={[styles.categoryAvatar, { backgroundColor: colors.bg }]}>
        <Icon size={14} color={category.color ?? colors.icon} strokeWidth={2} />
      </View>
      <Text
        style={[
          styles.categoryChipText,
          selected && styles.categoryChipTextSelected,
        ]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

// --- Date Field ---

function DateField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.dateField}>
      <CalendarDays size={16} color={Colors.textSecondary} strokeWidth={2} />
      <View style={{ marginLeft: 8 }}>
        <Text style={styles.dateLabel}>{label}</Text>
        <Text style={styles.dateValue}>
          {value
            ? new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Any"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 15, 46, 0.5)",
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  resetText: {
    color: Colors.tangerine,
    fontSize: 14,
    fontWeight: "500",
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
  },
  clearText: {
    color: Colors.tangerine,
    fontSize: 11,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.parchment,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.plum,
    borderWidth: 0,
  },
  typeChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  typeChipTextActive: {
    color: Colors.surface,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.parchment,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.plumTint,
    borderWidth: 1.5,
    borderColor: Colors.plum,
  },
  categoryAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipText: {
    color: Colors.textPrimary,
    fontSize: 12,
  },
  categoryChipTextSelected: {
    color: Colors.plum,
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.parchment,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  dateLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  dateValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  applyButton: {
    backgroundColor: Colors.plum,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  applyText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "500",
  },
});
