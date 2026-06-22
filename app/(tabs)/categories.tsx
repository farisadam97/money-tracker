import { useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Inbox } from "lucide-react-native";

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
import { CategoryCard } from "@/src/components/categories/category-card";
import { CategoryFormSheet } from "@/src/components/categories/category-form-sheet";
import type { CategoryRow } from "@/src/types/database";

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
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.parchment,
          paddingTop: insets.top + 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={Colors.plum} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.parchment,
        paddingTop: insets.top + 16,
      }}
    >
      <Text
        style={{
          color: Colors.textPrimary,
          fontSize: 20,
          fontWeight: "500",
          paddingHorizontal: 16,
          marginBottom: 16,
        }}
      >
        Categories
      </Text>

      <FlatList
        data={[{ type: "master" }, { type: "user" }]}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => {
          if (item.type === "master") {
            return (
              <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textSecondary,
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    DEFAULT CATEGORIES
                  </Text>
                  <View
                    style={{
                      backgroundColor: Colors.plumTint,
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.plum,
                        fontSize: 11,
                        fontWeight: "500",
                      }}
                    >
                      {master.length}
                    </Text>
                  </View>
                </View>

                {master.length === 0 ? (
                  <Text
                    style={{
                      color: Colors.textSecondary,
                      fontSize: 14,
                      textAlign: "center",
                      paddingVertical: 16,
                    }}
                  >
                    No default categories found. Run the SQL seed.
                  </Text>
                ) : (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
            );
          }

          // User categories section
          return (
            <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: Colors.textSecondary,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  MY CATEGORIES
                </Text>
                <View
                  style={{
                    backgroundColor: Colors.plumTint,
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.plum,
                      fontSize: 11,
                      fontWeight: "500",
                    }}
                  >
                    {userCategories.length}
                  </Text>
                </View>
              </View>

              {userCategories.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 32 }}>
                  <Inbox size={40} color={Colors.textSecondary} strokeWidth={1.5} />
                  <Text
                    style={{
                      color: Colors.textSecondary,
                      fontSize: 14,
                      marginTop: 8,
                    }}
                  >
                    No custom categories yet
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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

              {/* Add category card */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                <CategoryCard isAddCard onPress={handleOpenCreate} />
              </View>
            </View>
          );
        }}
      />

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
