import type { Book } from "@/types/book";

export type Recommendation = { book: Book; reason: string };

export async function fetchRecommendations(input: {
  query: string;
  tasteBasis?: string;
}): Promise<Recommendation[]> {
  const res = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "추천 중 오류가 발생했습니다.");
  }
  const data = (await res.json()) as { recommendations: Recommendation[] };
  return data.recommendations;
}
