"use client";

import { useState } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { SearchBar } from "./search-bar";
import { BookCard } from "./book-card";
import { useBookSearch } from "./use-book-search";

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="aspect-[3/4] w-full animate-pulse rounded-md bg-muted" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const { data, isLoading, isError, error } = useBookSearch(debouncedQuery);

  const isTyping = query !== debouncedQuery;
  const showSkeleton = isTyping || isLoading;
  const showEmpty = !showSkeleton && !isError && debouncedQuery.trim() && data?.items.length === 0;
  const showResults = !showSkeleton && !isError && (data?.items.length ?? 0) > 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight">책 검색</h1>
      <SearchBar value={query} onChange={setQuery} />

      <div className="mt-6">
        {!query.trim() && (
          <p className="text-center text-muted-foreground">
            검색어를 입력하면 결과가 표시됩니다.
          </p>
        )}

        {showSkeleton && query.trim() && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "오류가 발생했습니다."}
          </div>
        )}

        {showEmpty && (
          <p className="text-center text-muted-foreground">
            &apos;{debouncedQuery}&apos;에 대한 검색 결과가 없습니다.
          </p>
        )}

        {showResults && data && (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              총 {data.totalResults.toLocaleString()}건
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.items.map((book) => (
                <BookCard key={book.isbn} book={book} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
