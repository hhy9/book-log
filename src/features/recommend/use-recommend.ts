import { useMutation } from "@tanstack/react-query";
import { fetchRecommendations, type Recommendation } from "./api";

export function useRecommend() {
  return useMutation<Recommendation[], Error, { query: string; tasteBasis?: string }>({
    mutationFn: fetchRecommendations,
  });
}
