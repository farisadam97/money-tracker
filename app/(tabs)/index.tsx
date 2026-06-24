import { useRouter } from "expo-router";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react-native";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SpendingByCategory } from "@/src/components/home/spending-by-category";
import { getCategoryColors } from "@/src/constants/categories";
import { Colors } from "@/src/constants/colors";
import { resolveIcon } from "@/src/constants/icon-map";
import { useAuth } from "@/src/hooks/use-auth";
import { useCategoriesQuery } from "@/src/hooks/use-categories";
import { useRecentTransactionsQuery } from "@/src/hooks/use-transactions";
import type { TransactionRow } from "@/src/types/database";
import { useState } from "react";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data: transactions, isLoading } = useRecentTransactionsQuery(10);
  const { data: categories } = useCategoriesQuery();
  const [sectionsHeight, setSectionsHeight] = useState(0);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  // Calculate monthly totals from recent transactions
  const now = new Date();
  const monthTransactions = (transactions ?? []).filter((t) => {
    const tDate = new Date(t.date + "T00:00:00");
    return (
      tDate.getMonth() === now.getMonth() &&
      tDate.getFullYear() === now.getFullYear()
    );
  });

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const categoryName = (catId: string) =>
    categories?.find((c) => c.id === catId)?.name ?? "Other";

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingLabel}>Good day,</Text>
          <Text style={styles.greetingName}>{firstName}</Text>
        </View>
      </View>

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeaderRow}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.monthLabel}>
            {now.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>

        <View style={styles.incomeExpenseRow}>
          <View style={styles.incomeExpenseItem}>
            <View
              style={[styles.ieIcon, { backgroundColor: Colors.incomeTint }]}
            >
              <ArrowDownCircle
                size={14}
                color={Colors.income}
                strokeWidth={2.5}
              />
            </View>
            <View>
              <Text style={styles.ieLabel}>Income</Text>
              <Text style={styles.ieValueIncome}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
          </View>
          <View style={styles.incomeExpenseItem}>
            <View
              style={[styles.ieIcon, { backgroundColor: Colors.expenseTint }]}
            >
              <ArrowUpCircle
                size={16}
                color={Colors.expense}
                strokeWidth={2.5}
              />
            </View>
            <View>
              <Text style={styles.ieLabel}>Expenses</Text>
              <Text style={styles.ieValueExpense}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress bar */}
        {totalIncome > 0 ? (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.max(4, Math.min(100, (totalExpense / totalIncome) * 100))}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                {Math.round((totalExpense / totalIncome) * 100)}% spent
              </Text>
              <Text style={styles.progressLabel}>
                {Math.max(
                  0,
                  100 - Math.round((totalExpense / totalIncome) * 100),
                )}
                % saved
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Sections — each pane scrolls independently, balance card stays fixed.
          We measure the available height via onLayout and assign explicit
          pixel heights so the nested ScrollViews resolve reliably. */}
      <View
        style={styles.sectionsContainer}
        onLayout={(e: LayoutChangeEvent) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && h !== sectionsHeight) setSectionsHeight(h);
        }}
      >
        {/* Spending by category */}
        <View
          style={[
            styles.sectionPane,
            sectionsHeight > 0 && { height: (sectionsHeight - 12) / 2 },
          ]}
        >
          <SpendingByCategory />
        </View>

        {/* Recent transactions */}
        <View
          style={[
            styles.sectionPane,
            sectionsHeight > 0 && { height: (sectionsHeight - 12) / 2 },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Text
              style={styles.seeAll}
              onPress={() => router.push("/(tabs)/transactions" as never)}
            >
              See All
            </Text>
          </View>

          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {monthTransactions.length === 0 ? (
              <View style={styles.listEmptyState}>
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptyText}>
                  Tap the + button to add your first transaction
                </Text>
              </View>
            ) : (
              monthTransactions
                .slice(0, 5)
                .map((txn) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={txn}
                    categoryName={categoryName(txn.category_id)}
                  />
                ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

// --- Transaction Row ---

function TransactionRow({
  transaction,
  categoryName,
}: {
  transaction: TransactionRow;
  categoryName: string;
}) {
  const colors = getCategoryColors(categoryName);
  const Icon = resolveIcon(categoryName === "Other" ? "Tag" : categoryName);
  const isIncome = transaction.type === "income";

  return (
    <View style={styles.txnRow}>
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
      <View style={styles.txnRight}>
        <Text
          style={[
            styles.txnAmount,
            { color: isIncome ? Colors.income : Colors.expense },
          ]}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(Number(transaction.amount))}
        </Text>
      </View>
    </View>
  );
}

// --- Helpers ---

function formatCurrency(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parchment,
    paddingHorizontal: 16,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greetingLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  greetingName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "500",
  },
  balanceCard: {
    backgroundColor: Colors.plum,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  balanceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  monthLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "400",
  },
  balanceAmount: {
    color: Colors.surface,
    fontSize: 36,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 16,
  },
  incomeExpenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  incomeExpenseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  ieIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ieLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
  ieValueIncome: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "500",
  },
  ieValueExpense: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "500",
  },
  progressSection: {
    marginTop: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.tangerine,
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  seeAll: {
    color: Colors.plum,
    fontSize: 12,
    fontWeight: "500",
  },
  sectionsContainer: {
    flex: 1,
    minHeight: 0,
    gap: 12,
  },
  sectionPane: {
    flex: 1,
    minHeight: 0,
  },
  listScroll: {
    flex: 1,
    minHeight: 0,
  },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 6,
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
  txnRight: {
    alignItems: "flex-end",
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  listEmptyState: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
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
