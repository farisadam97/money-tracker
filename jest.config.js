/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|lucide-react-native|nativewind|@supabase/.*|zustand|@tanstack/.*|react-hook-form|zod|@hookform/.*|@gorhom/.*|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-date-picker|@react-native-async-storage/.*|expo-auth-session|expo-web-browser|expo-crypto|expo-linking|expo-router|expo-constants|expo-status-bar|expo-splash-screen|expo-system-ui|expo-font|expo-haptics|expo-image|expo-symbols|@shopify/.*|react-native-worklets)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/android/",
    "/ios/",
    "/__tests__/helpers/",
  ],
};
