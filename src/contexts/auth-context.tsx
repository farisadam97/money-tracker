import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "@/src/lib/supabase";
import { migrateGuestDataToSupabase } from "@/src/lib/migrate-guest";

const GUEST_KEY = "moneytracker_is_guest";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface AuthState {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID ?? "",
      scopes: ["openid", "profile", "email"],
    }
  );

  useEffect(() => {
    (async () => {
      const storedGuest = await AsyncStorage.getItem(GUEST_KEY);
      if (storedGuest === "true") {
        setIsGuest(true);
        setIsLoading(false);
        return;
      }

      const { data: { session: existingSession } } = await supabase.auth.getSession();
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession) {
          setIsGuest(false);
          AsyncStorage.removeItem(GUEST_KEY);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (response?.type === "success" && response.authentication?.idToken) {
      const idToken = response.authentication.idToken;
      (async () => {
        setIsLoading(true);
        try {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: idToken,
          });
          if (error) throw error;
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [response]);

  useEffect(() => {
    if (!isGuest && user?.id) {
      migrateGuestDataToSupabase(user.id);
    }
  }, [isGuest, user?.id]);

  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  const signInAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_KEY, "true");
    setIsGuest(true);
    setSession(null);
    setUser(null);
  };

  const signOut = async () => {
    if (isGuest) {
      await AsyncStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isGuest,
        isLoading,
        signInWithGoogle,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
