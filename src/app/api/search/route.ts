import { NextRequest, NextResponse } from "next/server";
import { searchAladinBooks } from "@/lib/aladin";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "검색어를 입력해주세요." }, { status: 400 });
  }

  if (!process.env.ALADIN_TTB_KEY) {
    return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const result = await searchAladinBooks(q);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "알라딘 API 오류가 발생했습니다." }, { status: 502 });
  }
}
