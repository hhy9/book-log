"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Book } from "@/types/book";
import type { ShelfItem, ShelfStatus } from "@/types/shelf";

type Props = {
  items: ShelfItem[];
  bookCache: Record<string, Book>;
};

const GROUPS: { status: ShelfStatus; label: string }[] = [
  { status: "done", label: "완독" },
  { status: "want", label: "읽고싶어요" },
];

function buildText(books: Book[]): string {
  return books
    .map((b) => [b.title, b.author, b.publisher].filter(Boolean).join(" / "))
    .join("\n");
}

function CopyGroup({ label, books }: { label: string; books: Book[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildText(books);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 권한이 없을 때를 대비한 폴백
      window.prompt("아래 내용을 복사하세요", text);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {label} <span className="text-muted-foreground">({books.length})</span>
        </h3>
        <button
          onClick={handleCopy}
          disabled={books.length === 0}
          className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:hover:bg-background"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              목록 복사
            </>
          )}
        </button>
      </div>
      {books.length === 0 ? (
        <p className="text-xs text-muted-foreground">아직 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {books.slice(0, 5).map((b) => (
            <li key={b.isbn} className="line-clamp-1">
              {b.title} / {b.author} / {b.publisher}
            </li>
          ))}
          {books.length > 5 && <li>… 외 {books.length - 5}권</li>}
        </ul>
      )}
    </div>
  );
}

export function CopyLists({ items, bookCache }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">목록 내보내기</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {GROUPS.map(({ status, label }) => {
          const books = items
            .filter((i) => i.status === status)
            .map((i) => bookCache[i.isbn])
            .filter((b): b is Book => !!b);
          return <CopyGroup key={status} label={label} books={books} />;
        })}
      </div>
    </div>
  );
}
