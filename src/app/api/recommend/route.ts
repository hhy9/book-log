import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { searchAladinBooks } from "@/lib/aladin";
import type { Book } from "@/types/book";

const MODEL = "gemini-2.5-flash";

type AiBook = { title: string; author: string; reason: string };
export type Recommendation = { book: Book; reason: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API 키가 설정되지 않았습니다." }, { status: 500 });
  }
  if (!process.env.ALADIN_TTB_KEY) {
    return NextResponse.json({ error: "알라딘 API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as {
    query?: string;
    tasteBasis?: string;
  } | null;
  const query = body?.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "추천 받을 내용을 입력해주세요." }, { status: 400 });
  }

  // 1) Gemini로 추천 책 목록(JSON)을 받는다.
  let aiBooks: AiBook[];
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = body?.tasteBasis
      ? `사용자의 독서 취향(읽은/읽고 싶은 책):\n${body.tasteBasis}\n\n위 취향을 참고해, 다음 요청에 맞는 책을 추천해줘.\n요청: ${query}`
      : `다음 요청에 맞는 책을 추천해줘.\n요청: ${query}`;

    const request = {
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          "너는 한국어로 답하는 독서 추천 사서다. 실제로 존재하며 한국에서 출간되어 알라딘에서 검색 가능한 도서만 3~5권 추천한다. 각 책마다 추천 이유를 한국어 한두 문장으로 적는다. 존재하지 않는 책을 지어내지 마라.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            books: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["title", "author", "reason"],
              },
            },
          },
          required: ["books"],
        },
      },
    };

    // 모델 일시 과부하(503 UNAVAILABLE)는 보통 잠깐이라 짧게 재시도한다.
    let response;
    for (let attempt = 0; ; attempt++) {
      try {
        response = await ai.models.generateContent(request);
        break;
      } catch (err) {
        const s = (err as { status?: number })?.status;
        const transient =
          s === 503 ||
          String(err).includes("UNAVAILABLE") ||
          String(err).includes("high demand") ||
          String(err).includes("overloaded");
        if (transient && attempt < 2) {
          await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }

    const parsed = JSON.parse(response.text ?? "{}") as { books?: AiBook[] };
    aiBooks = parsed.books ?? [];
  } catch (e) {
    console.error("[/api/recommend] Gemini 호출 실패:", e);
    const status = (e as { status?: number })?.status;
    const msg = e instanceof Error ? e.message : String(e);
    if (
      status === 429 ||
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.toLowerCase().includes("quota")
    ) {
      return NextResponse.json(
        { error: "AI 무료 사용량 한도에 도달했습니다. 잠시 후(약 1분) 다시 시도해주세요." },
        { status: 429 }
      );
    }
    if (
      status === 503 ||
      msg.includes("UNAVAILABLE") ||
      msg.includes("high demand") ||
      msg.includes("overloaded")
    ) {
      return NextResponse.json(
        { error: "AI 모델이 잠시 혼잡합니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "AI 추천 생성 중 오류가 발생했습니다." }, { status: 502 });
  }

  if (aiBooks.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }

  // 2) 받은 제목을 알라딘에서 재검색해 실제 표지/링크를 매칭한다(실패 시 제외).
  const seen = new Set<string>();
  const settled = await Promise.allSettled(
    aiBooks.map(async (b): Promise<Recommendation | null> => {
      const { items } = await searchAladinBooks(b.title);
      const match = items[0];
      if (!match) return null;
      return { book: match, reason: b.reason };
    })
  );

  const recommendations: Recommendation[] = [];
  for (const r of settled) {
    if (r.status !== "fulfilled" || !r.value) continue;
    if (seen.has(r.value.book.isbn)) continue;
    seen.add(r.value.book.isbn);
    recommendations.push(r.value);
  }

  return NextResponse.json({ recommendations });
}
