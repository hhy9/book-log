"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="제목, 저자, 출판사로 검색"
        className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
    </div>
  );
}
