import { BookDetailPage } from "@/features/book-detail/book-detail-page";

type Props = {
  params: Promise<{ isbn: string }>;
};

export default async function BookPage({ params }: Props) {
  const { isbn } = await params;
  return <BookDetailPage isbn={isbn} />;
}
