import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserPreferencesState {
  defaultCurrency: string;
  onboardingComplete: boolean;
  setDefaultCurrency: (code: string) => void;
  setOnboardingComplete: (value: boolean) => void;
  reset: () => void;
}

/**
 * Persists across app launches via AsyncStorage.
 * Currency is non-sensitive user preference — AsyncStorage is acceptable here
 * (unlike auth session tokens, which use SecureStore).
 */
export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      defaultCurrency: "IDR",
      onboardingComplete: false,
      setDefaultCurrency: (code) =>
        set({ defaultCurrency: code.toUpperCase().slice(0, 3) }),
      setOnboardingComplete: (value) => set({ onboardingComplete: value }),
      reset: () =>
        set({ defaultCurrency: "IDR", onboardingComplete: false }),
    }),
    {
      name: "moneytracker_user_preferences",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
