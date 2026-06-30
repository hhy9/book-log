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

      getItem: (isbn) => get().items.find((i) => i.isbn === isbn),
    }),
    { name: "booklog_shelf" }
  )
);
