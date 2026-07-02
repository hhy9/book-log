"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useShelfStore } from "@/features/shelf/use-shelf-store";
import { useHydrated } from "@/lib/use-hydrated";
import { useRecommend } from "./use-recommend";
import { RecommendCard } from "./recommend-card";

const EXAMPLES = [
  "요즘 마음이 복잡한데 위로가 되는 소설",
  "퇴근 후 가볍게 읽을 추리소설",
  "처음 읽어보는 과학 교양서",
];

export function RecommendPage() {
  const hydrated = useHydrated();
  const items = useShelfStore((s) => s.items);
  const bookCache = useShelfStore((s) => s.bookCache);

  const [query, setQuery] = useState("");
  const [useTaste, setUseTaste] = useState(false);
  const { mutate, data, isPending, isError, error } = useRecommend();

  const shelfCount = items.length;

  function buildTasteBasis(): string | undefined {
    if (!useTaste) return undefined;
    const lines = items
      .filter((i) => i.status === "done" || i.status === "want")
      .map((i) => bookCache[i.isbn])
      .filter(Boolean)
      .map((b) => `- ${b.title} (${b.author})`);
    return lines.length > 0 ? lines.join("\n") : undefined;
  }

  function handleSubmit() {
    const q = query.trim();
    if (!q || isPending) return;
    mutate({ query: q, tasteBasis: buildTasteBasis() });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-2 flex items-center gap-2 font-serif text-3xl font-bold tracking-tight">
        <Sparkles className="h-6 w-6 text-primary" />
        AI 추천
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        원하는 분위기나 상황을 적으면, 당신의 서재에 어울리는 책을 골라드려요.
      </p>

      <div className="flex flex-col gap-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          placeholder="예: 요즘 마음이 복잡한데 위로가 되는 소설"
          rows={3}
          className="resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {ex}
            </button>
          ))}
        </div>

        {hydrated && shelfCount > 0 && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={useTaste}
              onChange={(e) => setUseTaste(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            내 서재({shelfCount}권) 기반으로 취향 분석해서 추천
          </label>
        )}

        <button
          onClick={handleSubmit}
          disabled={!query.trim() || isPending}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              추천 받는 중...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              추천 받기
            </>
          )}
        </button>
      </div>

      <div className="mt-8">
        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "오류가 발생했습니다."}
          </div>
        )}

        {!isError && data && data.length === 0 && (
          <p className="text-center text-muted-foreground">
            조건에 맞는 책을 찾지 못했어요. 다른 표현으로 다시 시도해보세요.
          </p>
        )}

        {!isError && data && data.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{data.length}권을 추천해요</p>
            {data.map((rec) => (
              <RecommendCard key={rec.book.isbn} rec={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
