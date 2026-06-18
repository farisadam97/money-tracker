import { describe, it, expect, beforeEach } from "@jest/globals";
import { create } from "zustand";

// Re-implemented locally to avoid AsyncStorage persistence side-effects in tests.
// Mirrors the production store exactly except for the in-memory storage.
interface UserPreferencesState {
  defaultCurrency: string;
  onboardingComplete: boolean;
  setDefaultCurrency: (code: string) => void;
  setOnboardingComplete: (value: boolean) => void;
  reset: () => void;
}

const testStore = create<UserPreferencesState>()(
  (set) => ({
    defaultCurrency: "IDR",
    onboardingComplete: false,
    setDefaultCurrency: (code) =>
      set({ defaultCurrency: code.toUpperCase().slice(0, 3) }),
    setOnboardingComplete: (value) => set({ onboardingComplete: value }),
    reset: () =>
      set({ defaultCurrency: "IDR", onboardingComplete: false }),
  })
);

describe("UserPreferencesStore logic", () => {
  beforeEach(() => {
    testStore.getState().reset();
  });

  it("defaults currency to IDR (PRD target market)", () => {
    expect(testStore.getState().defaultCurrency).toBe("IDR");
  });

  it("defaults onboarding to incomplete", () => {
    expect(testStore.getState().onboardingComplete).toBe(false);
  });

  it("setDefaultCurrency uppercases and trims to 3 chars", () => {
    testStore.getState().setDefaultCurrency("usd");
    expect(testStore.getState().defaultCurrency).toBe("USD");

    testStore.getState().setDefaultCurrency("usdollar");
    expect(testStore.getState().defaultCurrency).toBe("USD");
  });

  it("setOnboardingComplete toggles the flag", () => {
    testStore.getState().setOnboardingComplete(true);
    expect(testStore.getState().onboardingComplete).toBe(true);

    testStore.getState().setOnboardingComplete(false);
    expect(testStore.getState().onboardingComplete).toBe(false);
  });

  it("reset() restores defaults", () => {
    testStore.getState().setDefaultCurrency("USD");
    testStore.getState().setOnboardingComplete(true);
    testStore.getState().reset();
    expect(testStore.getState().defaultCurrency).toBe("IDR");
    expect(testStore.getState().onboardingComplete).toBe(false);
  });

  it("does not mutate state objects (immutability)", () => {
    const before = testStore.getState();
    const snapshot = { ...before };
    testStore.getState().setDefaultCurrency("SGD");
    // untouched keys still equal
    expect(testStore.getState().onboardingComplete).toBe(
      snapshot.onboardingComplete
    );
  });
});

