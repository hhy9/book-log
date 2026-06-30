"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBooks } from "./api";

export function useBookSearch(query: string) {
  return useQuery({
    queryKey: ["books", "search", query],
    queryFn: () => fetchBooks(query),
    enabled: query.trim().length > 0,
  });
}
