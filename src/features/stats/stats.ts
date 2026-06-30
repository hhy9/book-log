import type { Book } from "@/types/book";
import type { ShelfItem } from "@/types/shelf";

export type MonthlyCount = { month: string; count: number };
export type GenreCount = { genre: string; count: number };

export type Stats = {
  /** 올해 1~12월 월별 완독 권수 */
  monthly: MonthlyCount[];
  /** 완독 책들의 장르 분포 (많은 순) */
  genres: GenreCount[];
  /** 완독 책들의 누적 페이지 수 */
  totalPages: number;
  /** 평점이 입력된 책들의 평균 평점 (없으면 null) */
  avgRating: number | null;
  /** 올해 완독 권수 (완독일 기준) */
  thisYearDone: number;
  /** 전체 완독 권수 */
  totalDone: number;
  /** 표시할 데이터가 하나라도 있는지 */
  hasData: boolean;
};

/** "YYYY-MM-DD" → { year, month(1~12) }. 형식이 아니면 null */
function parseYearMonth(dateStr: string | null): { year: number; month: number } | null {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})/.exec(dateStr);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) };
}

const MEDIA_SEGMENTS = new Set(["국내도서", "외국도서", "eBook", "중고도서", "외서"]);

/** 알라딘 카테고리 경로에서 대표 장르 한 단계 추출 */
export function extractGenre(category: string): string {
  if (!category) return "기타";
  const parts = category
    .split(">")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return "기타";
  const meaningful = parts.filter((p) => !MEDIA_SEGMENTS.has(p));
  return meaningful[0] ?? parts[parts.length - 1] ?? "기타";
}

export function computeStats(
  items: ShelfItem[],
  bookCache: Record<string, Book>,
  now: Date = new Date()
): Stats {
  const year = now.getFullYear();
  const doneItems = items.filter((i) => i.status === "done");

  // 월별 완독수 (올해)
  const monthly: MonthlyCount[] = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}월`,
    count: 0,
  }));
  let thisYearDone = 0;
  for (const item of doneItems) {
    const ym = parseYearMonth(item.finishedAt);
    if (ym && ym.year === year) {
      monthly[ym.month - 1].count += 1;
      thisYearDone += 1;
    }
  }

  // 장르 분포 (완독 기준)
  const genreMap = new Map<string, number>();
  for (const item of doneItems) {
    const book = bookCache[item.isbn];
    if (!book) continue;
    const genre = extractGenre(book.category);
    genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1);
  }
  const genres: GenreCount[] = [...genreMap.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);

  // 누적 페이지 (완독 기준)
  const totalPages = doneItems.reduce(
    (sum, item) => sum + (bookCache[item.isbn]?.pageCount ?? 0),
    0
  );

  // 평균 평점 (평점이 입력된 모든 책)
  const rated = items.filter((i) => i.rating != null) as (ShelfItem & { rating: number })[];
  const avgRating =
    rated.length > 0
      ? Math.round((rated.reduce((s, i) => s + i.rating, 0) / rated.length) * 10) / 10
      : null;

  return {
    monthly,
    genres,
    totalPages,
    avgRating,
    thisYearDone,
    totalDone: doneItems.length,
    hasData: items.length > 0,
  };
}
