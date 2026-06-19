import { type Session, type User } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/src/lib/supabase";

const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Dev-only: bypasses auth to test UI. No data access (RLS blocks). */
  devBypass: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "moneytracker",
    path: "oauthredirect",
  });

  const [_request, _response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    redirectUri,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    (async () => {
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (_response?.type === "success" && _response.authentication?.idToken) {
      const idToken = _response.authentication.idToken;
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
  }, [_response]);

  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const devBypass = async () => {
    if (!__DEV__) return;
    setIsLoading(true);
    try {
      // Anonymous auth creates a real user with a real UUID — no OAuth needed.
      // RLS works normally. Data persists in Supabase under this user.
      // Enable in: Supabase Dashboard → Authentication → Providers → Anonymous
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      // onAuthStateChange will set session + user automatically
    } catch (err) {
      // If anonymous auth not enabled in Supabase, fall back to fake user
      // (UI-only testing — no data access)
      console.warn(
        "[devBypass] Anonymous auth failed. Enable it in Supabase Dashboard → Authentication → Providers → Anonymous.",
        err
      );
      setSession({} as Session);
      setUser({
        id: "00000000-0000-0000-0000-000000000000",
        email: "dev@localhost",
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: { full_name: "Dev User" },
        created_at: new Date().toISOString(),
      } as unknown as User);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        devBypass,
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
