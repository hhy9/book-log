"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Book } from "@/types/book";
import type { ShelfItem, ShelfStatus } from "@/types/shelf";

type ShelfStore = {
  items: ShelfItem[];
  bookCache: Record<string, Book>;
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

export const useShelfStore = create<ShelfStore>()(
  persist(
    (set, get) => ({
      items: [],
      bookCache: {},

      addItem: (book) => {
        if (get().items.some((i) => i.isbn === book.isbn)) return;
        set((state) => ({
          items: [
            ...state.items,
            {
              id: crypto.randomUUID(),
              isbn: book.isbn,
              status: "want" as ShelfStatus,
              rating: null,
              memo: null,
              startedAt: null,
              finishedAt: null,
              createdAt: new Date().toISOString(),
            },
          ],
          bookCache: { ...state.bookCache, [book.isbn]: book },
        }));
      },

      removeItem: (isbn) =>
        set((state) => ({
          items: state.items.filter((i) => i.isbn !== isbn),
        })),

      updateStatus: (isbn, status) =>
        set((state) => ({
          items: state.items.map((i) => (i.isbn === isbn ? { ...i, status } : i)),
        })),

      updateRecord: (isbn, record) =>
        set((state) => ({
          items: state.items.map((i) => (i.isbn === isbn ? { ...i, ...record } : i)),
        })),

      cacheBook: (book) => {
        // 서재에 담긴 책의 캐시만 더 완전한 정보(페이지 수 등)로 갱신
        if (!get().items.some((i) => i.isbn === book.isbn)) return;
        const cached = get().bookCache[book.isbn];
        if (cached && cached.pageCount === book.pageCount && cached.description === book.description) {
          return;
        }
        set((state) => ({
          bookCache: { ...state.bookCache, [book.isbn]: book },
        }));
      },

      getItem: (isbn) => get().items.find((i) => i.isbn === isbn),
    }),
    { name: "booklog_shelf" }
  )
);
