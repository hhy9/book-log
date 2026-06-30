import { type AladinBook, type Book, toBook } from "@/types/book";

const ALADIN_SEARCH = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

export type AladinSearchResult = {
  totalResults: number;
  items: Book[];
};

/**
 * 알라딘 ItemSearch 프록시. 키는 서버에서만 사용한다.
 * 키가 없으면 throw하므로 호출부에서 처리한다.
 */
export async function searchAladinBooks(q: string): Promise<AladinSearchResult> {
  const ttbkey = process.env.ALADIN_TTB_KEY;
  if (!ttbkey) {
    throw new Error("ALADIN_TTB_KEY가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    ttbkey,
    Query: q,
    QueryType: "Keyword",
    SearchTarget: "Book",
    MaxResults: "20",
    Cover: "Big",
    output: "js",
    Version: "20131101",
  });

  const res = await fetch(`${ALADIN_SEARCH}?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error("알라딘 API 오류가 발생했습니다.");
  }

  const data: { totalResults?: number; item?: AladinBook[] } = await res.json();
  return {
    totalResults: data.totalResults ?? 0,
    items: (data.item ?? []).map(toBook),
  };
}
