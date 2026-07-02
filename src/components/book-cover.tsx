import Image from "next/image";

type Props = {
  coverUrl: string;
  title: string;
  sizes: string;
  className?: string;
};

/** 실제 표지 이미지를 책등(왼쪽) 판형 + 그림자로 감싼 공용 표지. */
export function BookCover({ coverUrl, title, sizes, className = "" }: Props) {
  return (
    <div className={`book-cover relative overflow-hidden bg-secondary ${className}`}>
      {coverUrl ? (
        <Image src={coverUrl} alt={title} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center font-serif text-xs leading-snug text-muted-foreground">
          {title}
        </div>
      )}
    </div>
  );
}
