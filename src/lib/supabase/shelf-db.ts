import type { Book } from "@/types/book";
import type { ShelfItem, ShelfStatus } from "@/types/shelf";
import { getSupabaseBrowserClient } from "./client";

type BookRow = {
  isbn: string;
  title: string;
  author: string | null;
  publisher: string | null;
  cover_url: string | null;
  category: string | null;
  pub_date: string | null;
  description: string | null;
  page_count: number;
};

type ShelfRow = {
  id: string;
  isbn: string;
  status: ShelfStatus;
  rating: number | null;
  memo: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  books: BookRow | null;
};

function rowToBook(r: BookRow): Book {
  return {
    isbn: r.isbn,
    title: r.title,
    author: r.author ?? "",
    publisher: r.publisher ?? "",
    coverUrl: r.cover_url ?? "",
    category: r.category ?? "",
    pubDate: r.pub_date ?? "",
    description: r.description ?? "",
    link: "",
    pageCount: r.page_count ?? 0,
  };
}

function bookToRow(b: Book) {
  return {
    isbn: b.isbn,
    title: b.title,
    author: b.author,
    publisher: b.publisher,
    cover_url: b.coverUrl,
    category: b.category,
    pub_date: b.pubDate,
    description: b.description,
    page_count: b.pageCount,
  };
}

function rowToItem(r: ShelfRow): ShelfItem {
  return {
    id: r.id,
    isbn: r.isbn,
    status: r.status,
    rating: r.rating,
    memo: r.memo,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    createdAt: r.created_at,
  };
}

/** 현재 사용자(RLS로 자동 격리)의 서재 + 책 캐시를 불러온다. */
export async function fetchShelf(): Promise<{
  items: ShelfItem[];
  bookCache: Record<string, Book>;
}> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("shelf_items")
    .select("*, books(*)")
    .order("created_at", { ascending: true });
  if (error) throw error;

  const items: ShelfItem[] = [];
  const bookCache: Record<string, Book> = {};
  for (const row of (data ?? []) as ShelfRow[]) {
    items.push(rowToItem(row));
    if (row.books) bookCache[row.isbn] = rowToBook(row.books);
  }
  return { items, bookCache };
}

export async function dbUpsertBook(book: Book): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("books").upsert(bookToRow(book), { onConflict: "isbn" });
  if (error) throw error;
}

export async function dbAddShelfItem(item: ShelfItem, book: Book): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await dbUpsertBook(book);
  // user_id는 컬럼 기본값 auth.uid()로 자동 설정된다.
  const { error } = await supabase.from("shelf_items").insert({
    id: item.id,
    isbn: item.isbn,
    status: item.status,
    rating: item.rating,
    memo: item.memo,
    started_at: item.startedAt,
    finished_at: item.finishedAt,
    created_at: item.createdAt,
  });
  if (error) throw error;
}

export async function dbRemoveShelfItem(isbn: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("shelf_items").delete().eq("isbn", isbn);
  if (error) throw error;
}

export type ShelfItemPatch = Partial<{
  status: ShelfStatus;
  rating: number | null;
  memo: string | null;
  started_at: string | null;
  finished_at: string | null;
}>;

export async function dbUpdateShelfItem(isbn: string, patch: ShelfItemPatch): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("shelf_items").update(patch).eq("isbn", isbn);
  if (error) throw error;
}

const MIGRATION_FLAG = "booklog_migrated_v1";

/** 기존 localStorage(booklog_shelf) 데이터를 현재 사용자 DB로 1회 이전한다. */
export async function migrateLocalStorageToDb(): Promise<void> {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATION_FLAG) === "done") return;

  const raw = localStorage.getItem("booklog_shelf");
  if (!raw) {
    localStorage.setItem(MIGRATION_FLAG, "done");
    return;
  }

  try {
    const parsed = JSON.parse(raw) as {
      state?: { items?: ShelfItem[]; bookCache?: Record<string, Book> };
    };
    const items = parsed.state?.items ?? [];
    const bookCache = parsed.state?.bookCache ?? {};
    for (const item of items) {
      const book = bookCache[item.isbn];
      if (!book) continue;
      try {
        await dbAddShelfItem(item, book);
      } catch {
        // 이미 존재하면(unique 충돌) 무시
      }
    }
    localStorage.setItem(MIGRATION_FLAG, "done");
  } catch (e) {
    console.error("localStorage → DB 이전 실패:", e);
  }
}
