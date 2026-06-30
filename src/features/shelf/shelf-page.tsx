"use client";

import { useState } from "react";
import type { ShelfStatus } from "@/types/shelf";
import { useShelfStore } from "./use-shelf-store";
import { ShelfBookCard } from "./shelf-book-card";

const TABS: { label: string; value: ShelfStatus }[] = [
  { label: "읽고싶어요", value: "want" },
  { label: "읽는중", value: "reading" },
  { label: "완독", value: "done" },
];

export function ShelfPage() {
  const [activeTab, setActiveTab] = useState<ShelfStatus>("want");
  const { items, bookCache } = useShelfStore();

  const filtered = items.filter((i) => i.status === activeTab);
  const counts = {
    want: items.filter((i) => i.status === "want").length,
    reading: items.filter((i) => i.status === "reading").length,
    done: items.filter((i) => i.status === "done").length,
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">내 서재</h1>

      <div className="flex gap-1 rounded-lg border bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="text-xs tabular-nums">({counts[tab.value]})</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            {activeTab === "want" && "읽고 싶은 책을 검색해서 담아보세요."}
            {activeTab === "reading" && "현재 읽고 있는 책이 없습니다."}
            {activeTab === "done" && "완독한 책이 없습니다."}
          </p>
        ) : (
          filtered.map((item) => {
            const book = bookCache[item.isbn];
            if (!book) return null;
            return <ShelfBookCard key={item.id} item={item} book={book} />;
          })
        )}
      </div>
    </div>
  );
}
