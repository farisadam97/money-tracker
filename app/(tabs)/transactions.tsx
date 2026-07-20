import { useRouter } from "expo-router";
import {
  Inbox,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenEntrance } from "@/src/components/shared/screen-entrance";
import { Toast } from "@/src/components/shared/toast";
import { ErrorState } from "@/src/components/shared/error-state";
import { FilterSheet } from "@/src/components/transactions/filter-sheet";
import { TransactionDetailSheet } from "@/src/components/transactions/transaction-detail-sheet";
import { getCategoryColors } from "@/src/constants/categories";
import { Colors } from "@/src/constants/colors";
import { resolveIcon } from "@/src/constants/icon-map";
import { useCategoriesQuery } from "@/src/hooks/use-categories";
import {
  useDeleteTransaction,
  useTransactionsQuery,
} from "@/src/hooks/use-transactions";
import { useFilterStore, type FilterType } from "@/src/stores/filter-store";
import {
  FILTER_TABS,
  FILTER_TAB_LABELS,
  type CategoryRow,
  type FilterTab,
  type TransactionRow,
} from "@/src/types/database";

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Filter state — from shared Zustand store (syncs with FilterSheet + chips)
  const {
    type,
    setType,
    categoryIds,
    clearCategories,
    dateFrom,
    dateTo,
    setDateRange,
    search,
    setSearch,
    reset: resetFilters,
    hasActiveFilters,
  } = useFilterStore();

  const {
    data: pagedData,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactionsQuery();
  const transactions = pagedData?.pages.flat() ?? [];
  const { data: categories } = useCategoriesQuery();
  const deleteTransaction = useDeleteTransaction();

  // Filter sheet visibility
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

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

  // Currently-selected transaction for the detail bottom sheet
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTxn = transactions?.find((t) => t.id === selectedId) ?? null;
  const selectedCategory =
    (categories?.find((c) => c.id === selectedTxn?.category_id) as
      | CategoryRow
      | undefined) ?? null;

  // Apply all filters
  const filtered = useMemo(() => {
    let result = transactions ?? [];

    if (type !== "all") {
      result = result.filter((t) => t.type === type);
    }

    if (categoryIds.length > 0) {
      result = result.filter((t) => categoryIds.includes(t.category_id));
    }

    if (dateFrom) {
      result = result.filter((t) => t.date >= dateFrom);
    }

    if (dateTo) {
      result = result.filter((t) => t.date <= dateTo);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.note?.toLowerCase().includes(q) ||
          getCatName(t.category_id, categories)?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [transactions, type, categoryIds, dateFrom, dateTo, search, categories]);

  // Group by date
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const categoryName = (catId: string) => getCatName(catId, categories);
  const categoryIcon = (catId: string) =>
    categories?.find((c) => c.id === catId)?.icon ?? "Tag";

  // Build active filter chips data
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (categoryIds.length > 0) {
      chips.push({
        label: `${categoryIds.length} categor${categoryIds.length > 1 ? "ies" : "y"}`,
        onRemove: clearCategories,
      });
    }
    if (dateFrom || dateTo) {
      const fmt = (d: string) =>
        new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });
      chips.push({
        label:
          dateFrom && dateTo
            ? `${fmt(dateFrom)} – ${fmt(dateTo)}`
            : dateFrom
              ? `From ${fmt(dateFrom)}`
              : `Until ${fmt(dateTo!)}`,
        onRemove: () => setDateRange(null, null),
      });
    }
    return chips;
  }, [categoryIds, dateFrom, dateTo, clearCategories, setDateRange]);

  return (
    <ScreenEntrance>
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        {/* Title + filter icon */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Transactions</Text>
          <TouchableOpacity
            onPress={() => setFilterSheetVisible(true)}
            style={styles.filterIconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal
              size={20}
              color={Colors.textSecondary}
              strokeWidth={2}
            />
            {hasActiveFilters() ? <View style={styles.filterDotBadge} /> : null}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Search
            size={16}
            color={Colors.textSecondary}
            strokeWidth={2}
            style={{ marginLeft: 4 }}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions"
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
          />
          {search.trim() ? (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={Colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick type tabs */}
        <FilterTabs type={type} setType={setType} />

        {/* Active filter chips */}
        {activeChips.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {activeChips.map((chip, i) => (
              <TouchableOpacity
                key={i}
                onPress={chip.onRemove}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{chip.label}</Text>
                <X size={12} color={Colors.plum} strokeWidth={2.5} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {/* Transactions list */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const distanceFromBottom =
              contentSize.height - (layoutMeasurement.height + contentOffset.y);
            if (
              distanceFromBottom < 400 &&
              hasNextPage &&
              !isFetchingNextPage
            ) {
              fetchNextPage();
            }
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={Colors.plum}
              colors={[Colors.plum]}
            />
          }
        >
          {isLoading ? (
            <View style={{ paddingHorizontal: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={styles.skeletonRow}>
                  <View style={styles.skeletonAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.skeletonLine} />
                    <View
                      style={[
                        styles.skeletonLine,
                        { width: "60%", marginTop: 6 },
                      ]}
                    />
                  </View>
                  <View style={[styles.skeletonLine, { width: 60 }]} />
                </View>
              ))}
            </View>
          ) : isError ? (
            <ErrorState
              onRetry={() => refetch()}
              style={{ paddingTop: 80 }}
            />
          ) : grouped.length === 0 ? (
            <View style={styles.emptyState}>
              <Inbox size={40} color={Colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>
                {hasActiveFilters()
                  ? "No transactions found"
                  : "No transactions yet"}
              </Text>
              <Text style={styles.emptyText}>
                {hasActiveFilters()
                  ? "Try adjusting your filters"
                  : "Tap + to add your first transaction"}
              </Text>
              {hasActiveFilters() ? (
                <TouchableOpacity
                  onPress={resetFilters}
                  style={styles.clearFiltersButton}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            grouped.map((group) => (
              <View key={group.dateKey} style={{ marginBottom: 20 }}>
                {/* Date header */}
                <Text style={styles.dateHeader}>{group.label}</Text>

                {/* Transactions for this date */}
                <View style={styles.dateGroup}>
                  {group.items.map((txn) => (
                    <TransactionRowItem
                      key={txn.id}
                      transaction={txn}
                      categoryName={categoryName(txn.category_id)}
                      categoryIcon={categoryIcon(txn.category_id)}
                      onPress={() => setSelectedId(txn.id)}
                      onDelete={() => {
                        deleteTransaction.mutate(txn.id, {
                          onSuccess: () => showToast("Transaction deleted"),
                          onError: () => showToast("Failed to delete", "error"),
                        });
                      }}
                    />
                  ))}
                </View>
              </View>
            ))
          )}

          {/* Infinite scroll footer */}
          {isFetchingNextPage ? (
            <View style={styles.listFooter}>
              <ActivityIndicator color={Colors.plum} size="small" />
            </View>
          ) : null}
        </ScrollView>

        {/* Transaction detail bottom sheet */}
        <TransactionDetailSheet
          visible={selectedId !== null}
          transaction={selectedTxn}
          category={selectedCategory}
          onClose={() => setSelectedId(null)}
          onEdit={(t) => {
            setSelectedId(null);
            router.push({
              pathname: "/add-transaction",
              params: { id: t.id },
            } as never);
          }}
          onDelete={(id) => {
            deleteTransaction.mutate(id, {
              onSuccess: () => showToast("Transaction deleted"),
              onError: () => showToast("Failed to delete", "error"),
            });
          }}
        />

        {/* Filter bottom sheet */}
        <FilterSheet
          visible={filterSheetVisible}
          onClose={() => setFilterSheetVisible(false)}
        />

        {/* Toast */}
        <Toast
          message={toastMessage}
          variant={toastVariant}
          visible={toastVisible}
          onDismiss={() => setToastVisible(false)}
        />
      </View>
    </ScreenEntrance>
  );
}

// --- Animated Filter Tabs ---

function FilterTabs({
  type,
  setType,
}: {
  type: FilterType;
  setType: (t: FilterType) => void;
}) {
  const [tabWidth, setTabWidth] = useState(0);
  const translateX = useSharedValue(0);

  const activeIndex = Math.max(0, FILTER_TABS.indexOf(type as FilterTab));

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withTiming(activeIndex * tabWidth, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [activeIndex, tabWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={styles.filterContainer}
      onLayout={(e) =>
        setTabWidth(e.nativeEvent.layout.width / FILTER_TABS.length)
      }
    >
      {/* Sliding indicator */}
      {tabWidth > 0 ? (
        <Animated.View
          style={[
            styles.filterTabIndicator,
            { width: tabWidth },
            indicatorStyle,
          ]}
        />
      ) : null}

      {/* Tabs */}
      {FILTER_TABS.map((tab) => {
        const isActive = type === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setType(tab as FilterType)}
            style={styles.filterTab}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                isActive && styles.filterTabTextActive,
              ]}
            >
              {FILTER_TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// --- Transaction Row ---

function TransactionRowItem({
  transaction,
  categoryName,
  categoryIcon,
  onPress,
  onDelete,
}: {
  transaction: TransactionRow;
  categoryName: string;
  categoryIcon?: string;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const colors = getCategoryColors(categoryName);
  const Icon = resolveIcon(categoryIcon ?? "Tag");
  const isIncome = transaction.type === "income";
  const swipeRef = useRef<InstanceType<typeof Swipeable>>(null);

  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <TouchableOpacity
        onPress={() => {
          swipeRef.current?.close();
          onDelete();
        }}
        style={styles.deleteAction}
        activeOpacity={0.8}
      >
        <Trash2 size={18} color={Colors.surface} strokeWidth={2} />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.txnRow}
        activeOpacity={0.7}
      >
        <View style={[styles.txnAvatar, { backgroundColor: colors.bg }]}>
          <Icon size={18} color={colors.icon} strokeWidth={2} />
        </View>
        <View style={styles.txnInfo}>
          <Text style={styles.txnCategory} numberOfLines={1}>
            {categoryName}
          </Text>
          {transaction.note ? (
            <Text style={styles.txnNote} numberOfLines={1}>
              {transaction.note}
            </Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.txnAmount,
            { color: isIncome ? Colors.income : Colors.expense },
          ]}
        >
          {isIncome ? "+" : "−"}
          {formatCurrency(Number(transaction.amount))}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

// --- Helpers ---

function getCatName(
  catId: string,
  categories: { id: string; name: string }[] | undefined,
): string {
  return categories?.find((c) => c.id === catId)?.name ?? "Other";
}

function formatCurrency(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

interface DateGroup {
  dateKey: string;
  label: string;
  items: TransactionRow[];
}

function groupByDate(transactions: TransactionRow[]): DateGroup[] {
  const groups = new Map<string, TransactionRow[]>();

  for (const txn of transactions) {
    const existing = groups.get(txn.date) ?? [];
    existing.push(txn);
    groups.set(txn.date, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, items]) => ({
      dateKey,
      label: formatDateHeader(dateKey),
      items: items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    }));
}

function formatDateHeader(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parchment,
  },
  screenTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterIconButton: {
    padding: 4,
    position: "relative",
  },
  filterDotBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.tangerine,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: Colors.plumTint,
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterTabIndicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 3,
    backgroundColor: Colors.surface,
    borderRadius: 9,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
    zIndex: 1,
  },
  filterTabText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: Colors.plum,
    fontWeight: "600",
  },
  dateHeader: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 4,
  },
  dateGroup: {
    gap: 4,
  },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 4,
  },
  txnAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txnInfo: {
    flex: 1,
  },
  txnCategory: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  txnNote: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  listFooter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 4,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    marginRight: 12,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  chipsScroll: {
    maxHeight: 36,
  },
  chipsContent: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.plumTint,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    color: Colors.plum,
    fontSize: 12,
    fontWeight: "500",
  },
  deleteAction: {
    backgroundColor: Colors.expense,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 12,
    marginLeft: 4,
  },
  clearFiltersButton: {
    marginTop: 16,
    backgroundColor: Colors.plum,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clearFiltersText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "500",
  },
});
