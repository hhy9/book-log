import { useQuery } from "@tanstack/react-query";
import type { Book } from "@/types/book";
import { useShelfStore } from "@/features/shelf/use-shelf-store";

async function fetchBookDetail(isbn: string): Promise<Book> {
  const res = await fetch(`/api/book/${isbn}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "책 정보를 불러올 수 없습니다.");
  }
  return res.json() as Promise<Book>;
}

export function useBookDetail(isbn: string) {
  const cached = useShelfStore((s) => s.bookCache[isbn]);

  // 캐시가 있으면 즉시 보여주되, 페이지 수 등 상세 정보를 채우기 위해
  // 백그라운드로 한 번 더 받아온다(서버 라우트가 1시간 캐싱).
  return useQuery<Book>({
    queryKey: ["book", isbn],
    queryFn: () => fetchBookDetail(isbn),
    initialData: cached,
    staleTime: 0,
  });
}
