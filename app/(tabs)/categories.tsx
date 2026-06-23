import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Inbox, Plus } from "lucide-react-native";

import { Colors } from "@/src/constants/colors";
import { resolveIcon } from "@/src/constants/icon-map";
import { useAuth } from "@/src/hooks/use-auth";
import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  partitionCategories,
} from "@/src/hooks/use-categories";
import { CategoryCard, CARD_WIDTH } from "@/src/components/categories/category-card";
import { CategoryFormSheet } from "@/src/components/categories/category-form-sheet";
import type { CategoryRow } from "@/src/types/database";

const GAP = 10;

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: categories, isLoading } = useCategoriesQuery();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formVisible, setFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);

  const { master, user: userCategories } = partitionCategories(categories ?? []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormVisible(true);
  };

  const handleOpenEdit = (cat: CategoryRow) => {
    setEditingCategory(cat);
    setFormVisible(true);
  };

  const handleSave = (data: { name: string; icon: string; color: string }) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...data });
    } else {
      createCategory.mutate({
        user_id: user?.id ?? null,
        ...data,
      });
    }
    setFormVisible(false);
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16 }, styles.center]}>
        <ActivityIndicator color={Colors.plum} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header with title + add button */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Categories</Text>
        <TouchableOpacity
          onPress={handleOpenCreate}
          style={styles.headerAddButton}
        >
          <Plus size={20} color={Colors.surface} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* DEFAULT CATEGORIES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>DEFAULT CATEGORIES</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{master.length}</Text>
            </View>
          </View>

          {master.length === 0 ? (
            <Text style={styles.emptyText}>
              No default categories found. Run the SQL seed.
            </Text>
          ) : (
            <View style={styles.grid}>
              {master.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  icon={resolveIcon(cat.icon)}
                />
              ))}
            </View>
          )}
        </View>

        {/* MY CATEGORIES */}
        <View style={[styles.section, { marginBottom: 0 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>MY CATEGORIES</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{userCategories.length}</Text>
            </View>
          </View>

          {userCategories.length === 0 ? (
            <TouchableOpacity
              onPress={handleOpenCreate}
              style={styles.emptyState}
            >
              <Inbox size={40} color={Colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.emptySubtext}>No custom categories yet</Text>
              <Text style={styles.emptyCta}>Tap + to add your first</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.grid}>
              {userCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  icon={resolveIcon(cat.icon)}
                  isEditable
                  onPress={() => handleOpenEdit(cat)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create/Edit bottom sheet */}
      <CategoryFormSheet
        visible={formVisible}
        category={editingCategory}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setFormVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parchment,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.plum,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  countBadge: {
    backgroundColor: Colors.plumTint,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countBadgeText: {
    color: Colors.plum,
    fontSize: 11,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  emptyCta: {
    color: Colors.plum,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
