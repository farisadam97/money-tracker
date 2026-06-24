import { useRouter } from "expo-router";
import {
  ChevronRight,
  FileText,
  Globe,
  Info,
  LogOut,
  Shield,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfirmDialog } from "@/src/components/shared/confirm-dialog";
import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/use-auth";
import { useUserPreferencesStore } from "@/src/stores/user-preferences-store";
import { useState } from "react";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const defaultCurrency = useUserPreferencesStore((s) => s.defaultCurrency);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.replace("/login" as never);
  };

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "User";
  const initials = fullName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Profile</Text>

      {/* User card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Settings section */}
      <Text style={styles.sectionLabel}>SETTINGS</Text>
      <View style={styles.settingsGroup}>
        <SettingsRow
          icon={Globe}
          label="Default Currency"
          value={defaultCurrency}
          onPress={() => {
            // Currency selector deferred to Phase 1.5
          }}
        />
      </View>

      {/* About section */}
      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ABOUT</Text>
      <View style={styles.settingsGroup}>
        <SettingsRow icon={Info} label="App Version" value="1.0.0" />
        <SettingsRow
          icon={FileText}
          label="Terms of Service"
          onPress={() => {
            // Open terms URL — deferred
          }}
        />
        <SettingsRow
          icon={Shield}
          label="Privacy Policy"
          isLast
          onPress={() => {
            // Open privacy URL — deferred
          }}
        />
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={() => setShowSignOutConfirm(true)}
        style={styles.signOutButton}
      >
        <LogOut size={18} color={Colors.expense} strokeWidth={2} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Sign out confirmation */}
      <ConfirmDialog
        visible={showSignOutConfirm}
        title="Sign out?"
        description="You'll need to sign in again to access your transactions."
        confirmLabel="Sign Out"
        destructive
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </ScrollView>
  );
}

// --- Settings Row ---

function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  isLast,
}: {
  icon: typeof Globe;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.settingsRow, !isLast && styles.settingsRowBorder]}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: Colors.plumTint }]}>
        <Icon size={16} color={Colors.plum} strokeWidth={2} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <ChevronRight size={16} color={Colors.textSecondary} /> : null}
    </TouchableOpacity>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parchment,
    paddingHorizontal: 16,
  },
  screenTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.plum,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 10,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  settingsRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  rowValue: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 32,
    borderWidth: 0.5,
    borderColor: Colors.expense,
    borderRadius: 12,
  },
  signOutText: {
    color: Colors.expense,
    fontSize: 14,
    fontWeight: "500",
  },
});
