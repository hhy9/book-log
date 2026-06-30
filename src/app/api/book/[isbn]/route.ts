import { NextRequest, NextResponse } from "next/server";
import { type AladinBook, toBook } from "@/types/book";

const ALADIN_LOOKUP = "http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await params;
  const ttbkey = process.env.ALADIN_TTB_KEY;

  if (!ttbkey) {
    return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const itemIdType = isbn.length === 13 ? "ISBN13" : "ISBN";
  const urlParams = new URLSearchParams({
    ttbkey,
    itemIdType,
    ItemId: isbn,
    Cover: "Big",
    OptResult: "subInfo",
    output: "js",
    Version: "20131101",
  });

  const res = await fetch(`${ALADIN_LOOKUP}?${urlParams}`, { next: { revalidate: 3600 } });

  if (!res.ok) {
    return NextResponse.json({ error: "알라딘 API 오류가 발생했습니다." }, { status: 502 });
  }

  const data: { item?: AladinBook[] } = await res.json();
  const item = data.item?.[0];

  if (!item) {
    return NextResponse.json({ error: "책을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(toBook(item));
}
