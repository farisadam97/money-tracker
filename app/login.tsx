import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Wallet } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/use-auth";

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, isLoading, devBypass } = useAuth();
  const router = useRouter();

  // Dev-only email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // Error is handled by auth context state; no-op here
    }
  };

  const handleEmailSignIn = async () => {
    setDevError(null);
    try {
      await signInWithEmail(email, password);
      router.replace("/(tabs)" as never);
    } catch (err) {
      setDevError(
        err instanceof Error ? err.message : "Sign in failed"
      );
    }
  };

  const handleDevBypass = async () => {
    await devBypass();
    router.replace("/(tabs)" as never);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.parchment }}>
      {/* Top 45% branding area */}
      <View
        className="items-center justify-center"
        style={{ height: "45%" }}
      >
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
        <Text style={{ color: Colors.plum, fontSize: 28, fontWeight: "500" }}>
          MoneyTracker
        </Text>
        <Text style={{ color: Colors.textSecondary, fontSize: 14, marginTop: 4 }}>
          Track smart, spend wise
        </Text>
      </View>

      {/* Center auth area */}
      <View className="flex-1 items-center px-6">
        <Text style={{ color: Colors.textPrimary, fontSize: 20, fontWeight: "500" }}>
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

        {/* Google OAuth button */}
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
              <View style={{ width: 20, height: 20, marginRight: 12 }}>
                <Text style={{ fontSize: 20, lineHeight: 20, fontWeight: "700" }}>
                  G
                </Text>
              </View>
              <Text style={{ color: Colors.textPrimary, fontSize: 14, fontWeight: "500" }}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Dev-only section — hidden in production builds */}
        {__DEV__ ? (
          <View style={{ width: "100%", maxWidth: 320, marginTop: 24 }}>
            {!showDevLogin ? (
              <View style={{ alignItems: "center", gap: 8 }}>
                <TouchableOpacity onPress={() => setShowDevLogin(true)}>
                  <Text
                    style={{ color: Colors.textSecondary, fontSize: 12 }}
                  >
                    Dev: Sign in with email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDevBypass}>
                  <Text
                    style={{ color: Colors.textSecondary, fontSize: 12 }}
                  >
                    Skip (Dev Only)
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    borderWidth: 0.5,
                    borderColor: Colors.border,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    color: Colors.textPrimary,
                    backgroundColor: Colors.surface,
                  }}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={{
                    borderWidth: 0.5,
                    borderColor: Colors.border,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                    color: Colors.textPrimary,
                    backgroundColor: Colors.surface,
                  }}
                />
                {devError ? (
                  <Text style={{ color: Colors.expense, fontSize: 12 }}>
                    {devError}
                  </Text>
                ) : null}
                <TouchableOpacity
                  onPress={handleEmailSignIn}
                  disabled={isLoading || !email || !password}
                  style={{
                    backgroundColor: Colors.plum,
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: "center",
                    opacity: isLoading || !email || !password ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{ color: Colors.surface, fontSize: 14, fontWeight: "500" }}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDevLogin(false)}>
                  <Text
                    style={{
                      color: Colors.textSecondary,
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}
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
