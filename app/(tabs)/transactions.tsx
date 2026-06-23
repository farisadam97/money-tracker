import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Inbox } from "lucide-react-native";

import { Colors } from "@/src/constants/colors";
import { useTransactionsQuery } from "@/src/hooks/use-transactions";
import { useCategoriesQuery } from "@/src/hooks/use-categories";
import { resolveIcon } from "@/src/constants/icon-map";
import { getCategoryColors } from "@/src/constants/categories";
import type { TransactionRow, TransactionType } from "@/src/types/database";

type FilterTab = "all" | TransactionType;

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const { data: transactions, isLoading } = useTransactionsQuery();
  const { data: categories } = useCategoriesQuery();

  // Apply search + filter
  const filtered = useMemo(() => {
    let result = transactions ?? [];

    if (filter !== "all") {
      result = result.filter((t) => t.type === filter);
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
  }, [transactions, filter, search, categories]);

  // Group by date
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const categoryName = (catId: string) => getCatName(catId, categories);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 12 }]}
    >
      {/* Title */}
      <Text style={styles.screenTitle}>Transactions</Text>

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
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        {(["all", "income", "expense"] as FilterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[
              styles.filterTab,
              filter === tab && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === tab && styles.filterTabTextActive,
              ]}
            >
              {tab === "all" ? "All" : tab === "income" ? "Income" : "Expenses"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {grouped.length === 0 ? (
          <View style={styles.emptyState}>
            <Inbox size={40} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>
              {search.trim() ? "No results found" : "No transactions yet"}
            </Text>
            <Text style={styles.emptyText}>
              {search.trim()
                ? "Try a different search"
                : "Tap + to add your first transaction"}
            </Text>
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
                    onPress={() =>
                      router.push({
                        pathname: "/add-transaction",
                        params: { id: txn.id },
                      } as never)
                    }
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// --- Transaction Row ---

function TransactionRowItem({
  transaction,
  categoryName,
  onPress,
}: {
  transaction: TransactionRow;
  categoryName: string;
  onPress?: () => void;
}) {
  const colors = getCategoryColors(categoryName);
  const Icon = resolveIcon(categoryName === "Other" ? "Tag" : categoryName);
  const isIncome = transaction.type === "income";

  return (
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
        {isIncome ? "+" : "-"}
        {formatCurrency(Number(transaction.amount))}
      </Text>
    </TouchableOpacity>
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
  return amount.toLocaleString("id-ID");
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
      items,
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
    paddingHorizontal: 16,
    marginBottom: 16,
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
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  filterTabActive: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
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
});
