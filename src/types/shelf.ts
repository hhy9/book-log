export type ShelfStatus = "want" | "reading" | "done";

export type ShelfItem = {
  id: string;
  isbn: string;
  status: ShelfStatus;
  rating: number | null;
  memo: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};
