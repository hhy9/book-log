"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { useShelfStore } from "@/features/shelf/use-shelf-store";
import { computeStats } from "./stats";
import { SummaryCards } from "./summary-cards";
import { MonthlyChart } from "./monthly-chart";
import { GenreChart } from "./genre-chart";
import { CopyLists } from "./copy-lists";

export function StatsPage() {
  // DB 로드 완료 후 렌더 (Recharts 측정 이슈 및 빈 상태 깜빡임 방지)
  const ready = useShelfStore((s) => s.ready);
  const items = useShelfStore((s) => s.items);
  const bookCache = useShelfStore((s) => s.bookCache);

  const year = new Date().getFullYear();
  const stats = computeStats(items, bookCache);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">통계</h1>

      {!ready ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : !stats.hasData ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-20 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            서재에 책을 담으면 독서 통계가 표시됩니다.
          </p>
          <Link
            href="/search"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            책 검색하러 가기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <SummaryCards stats={stats} />
          <div className="grid gap-4 lg:grid-cols-2">
            <MonthlyChart data={stats.monthly} year={year} />
            <GenreChart data={stats.genres} />
          </div>
          <CopyLists items={items} bookCache={bookCache} />
        </div>
      )}
    </div>
  );
}
