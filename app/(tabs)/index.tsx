import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowDownCircle, ArrowUpCircle, ChevronRight } from "lucide-react-native";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/use-auth";
import { useRecentTransactionsQuery } from "@/src/hooks/use-transactions";
import { useCategoriesQuery } from "@/src/hooks/use-categories";
import { resolveIcon } from "@/src/constants/icon-map";
import { getCategoryColors } from "@/src/constants/categories";
import type { TransactionRow } from "@/src/types/database";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data: transactions, isLoading } = useRecentTransactionsQuery(10);
  const { data: categories } = useCategoriesQuery();

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
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingLabel}>Good day,</Text>
          <Text style={styles.greetingName}>{firstName}</Text>
        </View>
      </View>

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>

        <View style={styles.incomeExpenseRow}>
          <View style={styles.incomeExpenseItem}>
            <View style={[styles.ieIcon, { backgroundColor: Colors.incomeTint }]}>
              <ArrowDownCircle size={16} color={Colors.income} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.ieLabel}>Income</Text>
              <Text style={styles.ieValueIncome}>{formatCurrency(totalIncome)}</Text>
            </View>
          </View>
          <View style={styles.incomeExpenseItem}>
            <View style={[styles.ieIcon, { backgroundColor: Colors.expenseTint }]}>
              <ArrowUpCircle size={16} color={Colors.expense} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.ieLabel}>Expenses</Text>
              <Text style={styles.ieValueExpense}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent transactions header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text
          style={styles.seeAll}
          onPress={() => router.push("/(tabs)/transactions" as never)}
        >
          See All
        </Text>
      </View>

      {/* Recent transactions list */}
      <View style={styles.transactionsList}>
        {monthTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button to add your first transaction
            </Text>
          </View>
        ) : (
          monthTransactions.slice(0, 5).map((txn) => (
            <TransactionRow
              key={txn.id}
              transaction={txn}
              categoryName={categoryName(txn.category_id)}
            />
          ))
        )}
      </View>
    </ScrollView>
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
  const Icon = resolveIcon(
    categoryName === "Other" ? "Tag" : categoryName
  );
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
  return amount.toLocaleString("id-ID");
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
    marginBottom: 24,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
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
    gap: 24,
  },
  incomeExpenseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ieIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  transactionsList: {
    gap: 4,
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
  emptyState: {
    alignItems: "center",
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
