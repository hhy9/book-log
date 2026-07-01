"use client";

import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "./auth-provider";

export function AuthButton() {
  const { user, isAnonymous, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return <span className="text-xs text-muted-foreground">…</span>;
  }

  if (!user || isAnonymous) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:px-2.5 sm:py-1"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Google 로그인</span>
      </button>
    );
  }

  const name =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "사용자";

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-[100px] truncate text-xs text-muted-foreground">{name}</span>
      <button
        onClick={signOut}
        className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:px-2.5 sm:py-1"
        aria-label="로그아웃"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">로그아웃</span>
      </button>
    </div>
  );
}
