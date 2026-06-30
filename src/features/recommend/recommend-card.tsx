"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import type { Recommendation } from "./api";
import { useShelfStore } from "@/features/shelf/use-shelf-store";

type Props = {
  rec: Recommendation;
};

export function RecommendCard({ rec }: Props) {
  const { book, reason } = rec;
  const { addItem, removeItem, getItem } = useShelfStore();
  const isInShelf = !!getItem(book.isbn);

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <Link
        href={`/book/${book.isbn}`}
        className="relative h-32 w-22 shrink-0 overflow-hidden rounded-md bg-muted"
        style={{ width: 88 }}
      >
        {book.coverUrl ? (
          <Image src={book.coverUrl} alt={book.title} fill sizes="88px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            표지 없음
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <Link
          href={`/book/${book.isbn}`}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:underline"
        >
          {book.title}
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">{book.author}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{book.publisher}</p>

        <p className="mt-1 line-clamp-3 rounded-md bg-muted/60 p-2 text-xs leading-relaxed">
          💡 {reason}
        </p>

        <button
          onClick={() => (isInShelf ? removeItem(book.isbn) : addItem(book))}
          className={`mt-auto flex w-fit items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            isInShelf
              ? "bg-primary text-primary-foreground hover:bg-primary/80"
              : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {isInShelf ? (
            <>
              <Check className="h-3.5 w-3.5" />
              서재에 있음
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              서재에 담기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
