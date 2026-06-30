"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import type { Book } from "@/types/book";
import { useShelfStore } from "@/features/shelf/use-shelf-store";

type Props = {
  book: Book;
};

export function BookCard({ book }: Props) {
  const { addItem, removeItem, getItem } = useShelfStore();
  const shelfItem = getItem(book.isbn);
  const isInShelf = !!shelfItem;

  function handleToggle() {
    if (isInShelf) {
      removeItem(book.isbn);
    } else {
      addItem(book);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            표지 없음
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <Link
          href={`/book/${book.isbn}`}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:underline"
        >
          {book.title}
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">{book.author}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{book.publisher}</p>
      </div>

      <button
        onClick={handleToggle}
        className={`mt-auto flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
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
  );
}
