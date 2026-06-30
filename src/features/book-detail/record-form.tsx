"use client";

import { useState } from "react";
import { useShelfStore } from "@/features/shelf/use-shelf-store";
import { StarRating } from "./star-rating";
import type { ShelfStatus } from "@/types/shelf";

const STATUS_LABELS: Record<ShelfStatus, string> = {
  want: "읽고싶어요",
  reading: "읽는중",
  done: "완독",
};

type Props = {
  isbn: string;
};

export function RecordForm({ isbn }: Props) {
  const item = useShelfStore((s) => s.getItem(isbn));
  const { updateStatus, updateRecord } = useShelfStore();

  const [rating, setRating] = useState<number | null>(item?.rating ?? null);
  const [memo, setMemo] = useState(item?.memo ?? "");
  const [startedAt, setStartedAt] = useState(item?.startedAt ?? "");
  const [finishedAt, setFinishedAt] = useState(item?.finishedAt ?? "");
  const [saved, setSaved] = useState(false);

  if (!item) return null;

  const showStartedAt = item.status === "reading" || item.status === "done";
  const showFinishedAt = item.status === "done";

  function handleSave() {
    updateRecord(isbn, {
      rating,
      memo: memo.trim() || null,
      startedAt: showStartedAt ? (startedAt || null) : null,
      finishedAt: showFinishedAt ? (finishedAt || null) : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <h2 className="font-semibold text-sm">내 기록</h2>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">상태</label>
        <select
          value={item.status}
          onChange={(e) => updateStatus(isbn, e.target.value as ShelfStatus)}
          className="w-fit rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {(Object.keys(STATUS_LABELS) as ShelfStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">별점</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">메모</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="감상을 적어보세요..."
          rows={3}
          className="rounded-md border bg-background px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      {showStartedAt && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">시작일</label>
          <input
            type="date"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            className="w-fit rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {showFinishedAt && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">완독일</label>
          <input
            type="date"
            value={finishedAt}
            onChange={(e) => setFinishedAt(e.target.value)}
            className="w-fit rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      <button
        onClick={handleSave}
        className="mt-1 self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {saved ? "저장됨 ✓" : "저장하기"}
      </button>
    </div>
  );
}
