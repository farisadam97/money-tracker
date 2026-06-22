// This file exists so Expo Router recognizes the "add" tab route.
// The tab is intercepted via onPress listener in _layout.tsx and redirects
// to /add-transaction instead of rendering this screen.
// Content is never shown to the user.

import { View } from "react-native";

export default function AddTabPlaceholder() {
  return <View />;
}
