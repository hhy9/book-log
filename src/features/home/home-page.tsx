"use client";

import Link from "next/link";
import { useShelfStore } from "@/features/shelf/use-shelf-store";
import { computeStats } from "@/features/stats/stats";
import { BookCover } from "@/components/book-cover";
import { BookSpine } from "@/components/book-spine";

function Tile({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-serif text-2xl font-bold tabular-nums">
        {value}
        {suffix && (
          <span className="ml-0.5 font-sans text-sm font-normal text-muted-foreground">{suffix}</span>
        )}
      </span>
    </div>
  );
}

export function HomePage() {
  const ready = useShelfStore((s) => s.ready);
  const items = useShelfStore((s) => s.items);
  const bookCache = useShelfStore((s) => s.bookCache);

  const year = new Date().getFullYear();
  const stats = computeStats(items, bookCache);

  const reading = items
    .filter((i) => i.status === "reading")
    .map((i) => bookCache[i.isbn])
    .filter(Boolean)[0];

  const recent = [...items]
    .reverse()
    .map((i) => bookCache[i.isbn])
    .filter(Boolean)
    .slice(0, 10);

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-24 text-center">
        <p className="kicker text-muted-foreground">{year} · 나의 서재</p>
        <h1 className="max-w-xl font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          읽은 책이 서재가 되는 경험
        </h1>
        <p className="text-sm text-muted-foreground">
          첫 책을 검색해 서재에 담아보세요.
        </p>
        <Link
          href="/search"
          className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          책 검색하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-9 px-5 py-10">
      <header className="flex flex-col gap-1.5">
        <p className="kicker text-muted-foreground">{year} · 나의 서재</p>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          올해 <span className="text-primary">{stats.thisYearDone}권</span>을 읽었어요
        </h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex gap-5 rounded-xl border bg-card p-6 lg:col-span-2">
          {reading ? (
            <>
              <BookCover
                coverUrl={reading.coverUrl}
                title={reading.title}
                sizes="96px"
                className="h-36 w-24 shrink-0"
              />
              <div className="flex min-w-0 flex-col gap-1.5">
                <p className="kicker text-muted-foreground">지금 읽는 중</p>
                <p className="line-clamp-2 font-serif text-lg font-semibold leading-snug">
                  {reading.title}
                </p>
                <p className="text-sm text-muted-foreground">{reading.author}</p>
                <Link
                  href={`/book/${reading.isbn}`}
                  className="mt-auto w-fit rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  이어서 읽기
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="kicker text-muted-foreground">지금 읽는 중</p>
              <p className="text-sm text-muted-foreground">
                읽는 중인 책이 없어요. 서재에서 &lsquo;읽는중&rsquo;으로 바꿔보세요.
              </p>
              <Link
                href="/shelf"
                className="mt-1 w-fit rounded-md border border-input bg-background px-4 py-2 text-xs font-medium transition-colors hover:bg-accent"
              >
                내 서재로
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          <Tile label="올해 완독" value={stats.thisYearDone.toLocaleString()} suffix="권" />
          <Tile label="누적 페이지" value={stats.totalPages.toLocaleString()} suffix="쪽" />
          <Tile
            label="평균 평점"
            value={stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
            suffix={stats.avgRating != null ? "점" : undefined}
          />
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-semibold">최근 서재</h2>
          <Link href="/shelf" className="text-xs text-muted-foreground hover:text-foreground">
            전체 보기 →
          </Link>
        </div>
        <div className="flex items-end gap-1.5 overflow-x-auto rounded-xl border border-b-[5px] border-b-primary bg-card px-6 pt-6">
          {recent.map((b, i) => (
            <BookSpine key={b.isbn} isbn={b.isbn} title={b.title} height={100 + ((i * 13) % 44)} />
          ))}
        </div>
      </section>
    </div>
  );
}
