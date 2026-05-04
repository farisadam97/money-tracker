import { supabase } from "@/src/lib/supabase";
import { useGuestDataStore } from "@/src/stores/guest-data-store";

export async function migrateGuestDataToSupabase(userId: string) {
  const { categories, transactions } = useGuestDataStore.getState().getAllData();

  if (categories.length === 0 && transactions.length === 0) {
    return { migrated: false };
  }

  const categoryIdMap = new Map<string, string>();

  for (const cat of categories) {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        is_active: cat.is_active,
      } as never)
      .select("id")
      .single();

    if (!error && data) {
      categoryIdMap.set(cat.id, (data as { id: string }).id);
    }
  }

  const rows = transactions.map((t) => ({
    user_id: userId,
    amount: t.amount,
    currency: t.currency,
    category_id: categoryIdMap.get(t.category_id) ?? t.category_id,
    type: t.type,
    note: t.note,
    date: t.date,
    source: t.source,
  }));

  if (rows.length > 0) {
    await supabase.from("transactions").insert(rows as never);
  }

  useGuestDataStore.getState().clearAllData();

  return {
    migrated: true,
    categories: categoryIdMap.size,
    transactions: rows.length,
  };
}
