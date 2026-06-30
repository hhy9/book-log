import type { Book } from "@/types/book";

type SearchResult = {
  totalResults: number;
  items: Book[];
};

export async function fetchBooks(q: string): Promise<SearchResult> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "검색 중 오류가 발생했습니다.");
  }
  return res.json() as Promise<SearchResult>;
}
