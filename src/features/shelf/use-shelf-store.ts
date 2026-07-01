"use client";

import { create } from "zustand";
import type { Book } from "@/types/book";
import type { ShelfItem, ShelfStatus } from "@/types/shelf";
import {
  fetchShelf,
  dbAddShelfItem,
  dbRemoveShelfItem,
  dbUpdateShelfItem,
  dbUpsertBook,
  type ShelfItemPatch,
} from "@/lib/supabase/shelf-db";

type ShelfStore = {
  items: ShelfItem[];
  bookCache: Record<string, Book>;
  /** DB 최초 로드 완료 여부 */
  ready: boolean;
  load: () => Promise<void>;
  reset: () => void;
  addItem: (book: Book) => void;
  removeItem: (isbn: string) => void;
  updateStatus: (isbn: string, status: ShelfStatus) => void;
  updateRecord: (
    isbn: string,
    record: Partial<Pick<ShelfItem, "rating" | "memo" | "startedAt" | "finishedAt">>
  ) => void;
  cacheBook: (book: Book) => void;
  getItem: (isbn: string) => ShelfItem | undefined;
};

export const useShelfStore = create<ShelfStore>()((set, get) => ({
  items: [],
  bookCache: {},
  ready: false,

  load: async () => {
    try {
      const { items, bookCache } = await fetchShelf();
      set({ items, bookCache, ready: true });
    } catch (e) {
      console.error("서재 불러오기 실패:", e);
      set({ ready: true });
    }
  },

  reset: () => set({ items: [], bookCache: {}, ready: false }),

  addItem: (book) => {
    if (get().items.some((i) => i.isbn === book.isbn)) return;
    const item: ShelfItem = {
      id: crypto.randomUUID(),
      isbn: book.isbn,
      status: "want",
      rating: null,
      memo: null,
      startedAt: null,
      finishedAt: null,
      createdAt: new Date().toISOString(),
    };
    // 낙관적 로컬 반영
    set((s) => ({
      items: [...s.items, item],
      bookCache: { ...s.bookCache, [book.isbn]: book },
    }));
    // 백그라운드 DB 저장 (실패 시 로컬 롤백)
    dbAddShelfItem(item, book).catch((e) => {
      console.error("담기 저장 실패:", e);
      set((s) => ({ items: s.items.filter((i) => i.isbn !== book.isbn) }));
    });
  },

  removeItem: (isbn) => {
    const prev = get().items;
    set((s) => ({ items: s.items.filter((i) => i.isbn !== isbn) }));
    dbRemoveShelfItem(isbn).catch((e) => {
      console.error("빼기 저장 실패:", e);
      set({ items: prev });
    });
  },

  updateStatus: (isbn, status) => {
    set((s) => ({
      items: s.items.map((i) => (i.isbn === isbn ? { ...i, status } : i)),
    }));
    dbUpdateShelfItem(isbn, { status }).catch((e) => console.error("상태 저장 실패:", e));
  },

  updateRecord: (isbn, record) => {
    set((s) => ({
      items: s.items.map((i) => (i.isbn === isbn ? { ...i, ...record } : i)),
    }));
    const patch: ShelfItemPatch = {};
    if ("rating" in record) patch.rating = record.rating ?? null;
    if ("memo" in record) patch.memo = record.memo ?? null;
    if ("startedAt" in record) patch.started_at = record.startedAt ?? null;
    if ("finishedAt" in record) patch.finished_at = record.finishedAt ?? null;
    dbUpdateShelfItem(isbn, patch).catch((e) => console.error("기록 저장 실패:", e));
  },

  cacheBook: (book) => {
    if (!get().items.some((i) => i.isbn === book.isbn)) return;
    const cached = get().bookCache[book.isbn];
    if (cached && cached.pageCount === book.pageCount && cached.description === book.description) {
      return;
    }
    set((s) => ({ bookCache: { ...s.bookCache, [book.isbn]: book } }));
    dbUpsertBook(book).catch((e) => console.error("책 정보 갱신 실패:", e));
  },

  getItem: (isbn) => get().items.find((i) => i.isbn === isbn),
}));
