"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  value: number | null;
  onChange: (rating: number | null) => void;
};

export function StarRating({ value, onChange }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(value === star ? null : star)}
          aria-label={`별점 ${star}점`}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= display
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-muted-foreground"
            }`}
          />
        </button>
      ))}
      {value !== null && (
        <span className="ml-1 text-sm text-muted-foreground">{value}점</span>
      )}
    </div>
  );
}
