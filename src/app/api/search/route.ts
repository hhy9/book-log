import { NextRequest, NextResponse } from "next/server";
import { type AladinBook, toBook } from "@/types/book";

const ALADIN_BASE = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "검색어를 입력해주세요." }, { status: 400 });
  }

  const ttbkey = process.env.ALADIN_TTB_KEY;
  if (!ttbkey) {
    return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
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

  const res = await fetch(`${ALADIN_BASE}?${params}`, { next: { revalidate: 60 } });

  if (!res.ok) {
    return NextResponse.json({ error: "알라딘 API 오류가 발생했습니다." }, { status: 502 });
  }

  const data: { totalResults?: number; item?: AladinBook[] } = await res.json();

  return NextResponse.json({
    totalResults: data.totalResults ?? 0,
    items: (data.item ?? []).map(toBook),
  });
}
