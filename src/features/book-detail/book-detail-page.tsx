"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Check, ChevronLeft } from "lucide-react";
import { useShelfStore } from "@/features/shelf/use-shelf-store";
import { useBookDetail } from "./use-book-detail";
import { RecordForm } from "./record-form";

type Props = {
  isbn: string;
};

export function BookDetailPage({ isbn }: Props) {
  const router = useRouter();
  const { data: book, isLoading, isError, error } = useBookDetail(isbn);
  const { addItem, removeItem, getItem, cacheBook } = useShelfStore();
  const shelfItem = getItem(isbn);
  const isInShelf = !!shelfItem;

  // 받아온 상세 정보(페이지 수 등)를 서재 캐시에 반영해 통계에서 쓰이도록 함
  useEffect(() => {
    if (book) cacheBook(book);
  }, [book, cacheBook]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 animate-pulse">
        <div className="flex gap-6">
          <div className="w-32 shrink-0 aspect-[3/4] rounded-lg bg-muted" />
          <div className="flex-1 flex flex-col gap-3 pt-1">
            <div className="h-6 w-2/3 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-4 w-1/4 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "책 정보를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="h-4 w-4" />
        뒤로
      </button>

      <div className="flex gap-6">
        <div className="relative w-32 shrink-0 aspect-[3/4] rounded-lg overflow-hidden bg-muted">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
              표지 없음
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-xl font-bold leading-snug">{book.title}</h1>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          <p className="text-sm text-muted-foreground">
            {book.publisher}
            {book.pubDate ? ` · ${book.pubDate}` : ""}
          </p>
          {book.category && (
            <p className="text-xs text-muted-foreground">{book.category}</p>
          )}

          <button
            onClick={() => (isInShelf ? removeItem(isbn) : addItem(book))}
            className={`mt-2 flex w-fit items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isInShelf
                ? "bg-primary text-primary-foreground hover:bg-primary/80"
                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {isInShelf ? (
              <>
                <Check className="h-4 w-4" />
                서재에 있음
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                서재에 담기
              </>
            )}
          </button>
        </div>
      </div>

      {book.description && (
        <p className="text-sm text-muted-foreground leading-relaxed border-t pt-4">
          {book.description}
        </p>
      )}

      {isInShelf && <RecordForm isbn={isbn} />}
    </div>
  );
}
