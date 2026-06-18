/**
 * Jest setup — runs before all test files.
 * Provides environment variables that supabase.ts requires at module load.
 */
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID = "test-google-client-id";

// Mock AsyncStorage — required by zustand persist middleware in user-preferences-store
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
  getAllKeys: jest.fn(async () => []),
  multiGet: jest.fn(async () => []),
  multiSet: jest.fn(async () => undefined),
  multiRemove: jest.fn(async () => undefined),
}));

// Mock NetInfo — required by SyncProvider
jest.mock("@react-native-community/netinfo", () => ({
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
  },
}));
