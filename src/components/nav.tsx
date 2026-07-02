"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/features/auth/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/search", label: "책 검색" },
  { href: "/shelf", label: "내 서재" },
  { href: "/stats", label: "통계" },
  { href: "/recommend", label: "AI 추천" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5 sm:gap-7">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-5 w-4 items-center justify-center rounded-[1px] border-[1.5px] border-primary">
            <span className="h-3 w-px bg-primary" />
          </span>
          <span className="font-serif text-lg font-bold tracking-tight">책장</span>
        </Link>
        <div className="flex gap-4 overflow-x-auto sm:gap-5">
          {LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 border-b-2 pb-0.5 text-[13.5px] transition-colors ${
                  active
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <AuthButton />
        </div>
      </nav>
    </header>
  );
}
