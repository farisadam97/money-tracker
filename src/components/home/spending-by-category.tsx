import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getCategoryColors } from "@/src/constants/categories";
import { Colors } from "@/src/constants/colors";
import { resolveIcon } from "@/src/constants/icon-map";
import { useSummaryQuery } from "@/src/hooks/use-summary";

const MAX_ROWS = 5;

/**
 * Home dashboard section showing the top spending categories for the current
 * month with a thin progress bar per category (fill = category icon color).
 *
 * Layout: the root uses `flex: 1` so the component fills any bounded parent
 * (e.g. a split-pane home layout). The header stays fixed at the top of the
 * section and the list scrolls internally. When rendered without a bounded
 * parent it behaves like a normal block.
 *
 * Data comes from `useSummaryQuery` which already computes an expense-only
 * category breakdown sorted by total descending.
 */
export function SpendingByCategory() {
  const router = useRouter();
  const { data } = useSummaryQuery();
  const rows = (data?.byCategory ?? []).slice(0, MAX_ROWS);
  const hasExpenses = rows.length > 0 && (data?.totalExpense ?? 0) > 0;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        <Text
          style={styles.seeAll}
          onPress={() => router.push("/(tabs)/categories" as never)}
        >
          See all
        </Text>
      </View>

      {hasExpenses ? (
        <View style={styles.card}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {rows.map((item, index) => {
              const Icon = resolveIcon(item.categoryIcon);
              const colors = getCategoryColors(item.categoryName);
              const isLast = index === rows.length - 1;
              // percentage is 0-100 with one decimal; clamp to a visible min
              const widthPct = Math.max(2, Math.min(100, item.percentage));
              return (
                <View
                  key={item.categoryId}
                  style={[styles.row, isLast && styles.rowLast]}
                >
                  <View style={styles.rowTop}>
                    <View style={styles.rowLeft}>
                      <View
                        style={[styles.avatar, { backgroundColor: colors.bg }]}
                      >
                        <Icon
                          size={16}
                          color={item.categoryColor}
                          strokeWidth={2}
                        />
                      </View>
                      <Text style={styles.categoryName} numberOfLines={1}>
                        {item.categoryName}
                      </Text>
                    </View>
                    <Text style={styles.amount}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${widthPct}%`,
                          backgroundColor: item.categoryColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No expenses this month</Text>
        </View>
      )}
    </View>
  );
}

function formatCurrency(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
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
    color: Colors.tangerine,
    fontSize: 12,
    fontWeight: "500",
  },
  card: {
    flex: 1,
    minHeight: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  categoryName: {
    color: Colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  amount: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
  },
  barTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
