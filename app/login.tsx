import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Wallet, AlertCircle } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/use-auth";

/**
 * Google "G" logo as inline SVG path.
 * Standard Google brand colors per branding guidelines.
 */
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, marginRight: 12 }}>
      <Text style={{ fontSize: size, lineHeight: size, fontWeight: "700" }}>G</Text>
    </View>
  );
}

export default function LoginScreen() {
  const { signInWithGoogle, isLoading } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // Error is handled by auth context state; no-op here
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.parchment }}>
      {/* Top 45% branding area */}
      <View
        className="items-center justify-center"
        style={{ height: "45%" }}
      >
        {/* Placeholder logo */}
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            backgroundColor: Colors.plum,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Wallet size={48} color={Colors.surface} strokeWidth={2} />
        </View>
        <Text
          style={{ color: Colors.plum, fontSize: 28, fontWeight: "500" }}
        >
          MoneyTracker
        </Text>
        <Text
          style={{ color: Colors.textSecondary, fontSize: 14, marginTop: 4 }}
        >
          Track smart, spend wise
        </Text>
      </View>

      {/* Center auth area */}
      <View className="flex-1 items-center px-6">
        <Text
          style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: "500" }}
        >
          Welcome back
        </Text>
        <Text
          style={{
            color: Colors.textSecondary,
            fontSize: 14,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          Sign in to continue tracking your finances
        </Text>

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={isLoading}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.surface,
            borderWidth: 0.5,
            borderColor: Colors.border,
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 24,
            marginTop: 32,
            width: "100%",
            maxWidth: 320,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.textPrimary} size="small" />
          ) : (
            <>
              <GoogleLogo size={20} />
              <Text
                style={{
                  color: Colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="pb-8 px-6">
        <Text
          style={{
            color: Colors.textSecondary,
            fontSize: 11,
            textAlign: "center",
          }}
        >
          By continuing you agree to our{" "}
          <Text style={{ color: Colors.plum, textDecorationLine: "underline" }}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={{ color: Colors.plum, textDecorationLine: "underline" }}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}
