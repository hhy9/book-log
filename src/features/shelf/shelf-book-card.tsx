"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { Book } from "@/types/book";
import type { ShelfItem, ShelfStatus } from "@/types/shelf";
import { useShelfStore } from "./use-shelf-store";

const STATUS_LABELS: Record<ShelfStatus, string> = {
  want: "읽고싶어요",
  reading: "읽는중",
  done: "완독",
};

type Props = {
  item: ShelfItem;
  book: Book;
};

export function ShelfBookCard({ item, book }: Props) {
  const { updateStatus, removeItem } = useShelfStore();

  return (
    <div className="flex gap-3 rounded-lg border bg-card p-3 shadow-sm">
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            표지 없음
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <Link
          href={`/book/${item.isbn}`}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:underline"
        >
          {book.title}
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">{book.author}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{book.publisher}</p>

        <select
          value={item.status}
          onChange={(e) => updateStatus(item.isbn, e.target.value as ShelfStatus)}
          className="mt-auto w-fit rounded-md border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
        >
          {(Object.keys(STATUS_LABELS) as ShelfStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => removeItem(item.isbn)}
        className="shrink-0 self-start rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        aria-label="서재에서 빼기"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
