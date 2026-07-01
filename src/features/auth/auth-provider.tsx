"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { migrateLocalStorageToDb } from "@/lib/supabase/shelf-db";
import { useShelfStore } from "@/features/shelf/use-shelf-store";

type AuthContextValue = {
  user: User | null;
  isAnonymous: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useShelfStore((s) => s.load);
  const reset = useShelfStore((s) => s.reset);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      // 익명→Google '연결'이 "이미 다른 계정에 연결됨"으로 실패한 경우:
      // 일반 Google 로그인으로 폴백해서 기존 계정으로 로그인시킨다.
      if (
        typeof window !== "undefined" &&
        window.location.hash.includes("identity_already_exists")
      ) {
        history.replaceState(null, "", window.location.pathname);
        // 익명 세션을 정리한 뒤 기존 Google 계정으로 일반 로그인
        await supabase.auth.signOut();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) console.error("Google 로그인 폴백 실패:", error);
        return; // 리다이렉트 발생
      }

      const { data } = await supabase.auth.getSession();
      let currentUser = data.session?.user ?? null;

      // 세션이 없으면 익명으로 자동 로그인 (로그인 없이 바로 사용)
      if (!currentUser) {
        const { data: anon, error } = await supabase.auth.signInAnonymously();
        if (error) console.error("익명 로그인 실패:", error);
        currentUser = anon?.user ?? null;
      }

      if (!active) return;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        await migrateLocalStorageToDb();
        await load();
      }
    }

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, load]);

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback`;
    // 익명 사용자면 기존 데이터를 유지한 채 Google 신원을 연결(linkIdentity),
    // 그 외에는 일반 OAuth 로그인.
    if (user?.is_anonymous) {
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: { redirectTo },
      });
      if (error) console.error("Google 연결 실패:", error);
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) console.error("Google 로그인 실패:", error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    reset();
    // 로그아웃 후 다시 익명 세션으로 전환(빈 서재)
    const { data: anon } = await supabase.auth.signInAnonymously();
    setUser(anon?.user ?? null);
    await load();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAnonymous: !!user?.is_anonymous,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
