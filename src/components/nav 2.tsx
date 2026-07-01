"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/search", label: "책 검색" },
  { href: "/shelf", label: "내 서재" },
  { href: "/stats", label: "통계" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-base font-bold">
          책장
        </Link>
        <div className="flex gap-4">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors hover:text-foreground ${
                pathname.startsWith(href)
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
