import Link from "next/link";

const SPINE_COLORS = [
  "#7a3b3b",
  "#3b5a4a",
  "#c58a3d",
  "#4a4a6b",
  "#6b4a5a",
  "#5a6b7a",
  "#4a5a3b",
  "#8a5a2b",
];

function colorFor(isbn: string): string {
  let h = 0;
  for (let i = 0; i < isbn.length; i++) h = (h * 31 + isbn.charCodeAt(i)) | 0;
  return SPINE_COLORS[Math.abs(h) % SPINE_COLORS.length];
}

type Props = {
  isbn: string;
  title: string;
  height: number;
};

/** 책장 선반에 꽂힌 책등 하나. 실제 서가처럼 높이를 조금씩 다르게. */
export function BookSpine({ isbn, title, height }: Props) {
  return (
    <Link
      href={`/book/${isbn}`}
      title={title}
      style={{ backgroundColor: colorFor(isbn), height }}
      className="flex w-9 shrink-0 items-start justify-center overflow-hidden rounded-t-[2px] pt-3 shadow-[1px_2px_6px_rgba(40,28,12,0.28)] transition-transform hover:-translate-y-1"
    >
      <span
        className="line-clamp-4 font-serif text-[11px] font-medium leading-tight text-[#f4ebda]"
        style={{ writingMode: "vertical-rl" }}
      >
        {title}
      </span>
    </Link>
  );
}
