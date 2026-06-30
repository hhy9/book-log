/** 알라딘 API ItemSearch 응답의 개별 item 형태 */
export type AladinBook = {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  isbn: string;
  isbn13: string;
  itemId: number;
  priceSales: number;
  priceStandard: number;
  cover: string;
  categoryId: number;
  categoryName: string;
  publisher: string;
  salesPoint: number;
  adult: boolean;
  customerReviewRank: number;
  /** ItemLookUp에서 OptResult=subInfo 요청 시에만 포함 */
  subInfo?: {
    itemPage?: number;
  };
};

/** 앱 내부에서 사용하는 책 도메인 모델 */
export type Book = {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  coverUrl: string;
  category: string;
  pubDate: string;
  description: string;
  link: string;
  /** 페이지 수. 상세(ItemLookUp)에서만 채워지며, 없으면 0 */
  pageCount: number;
};

/** AladinBook → Book 변환 */
export function toBook(item: AladinBook): Book {
  return {
    isbn: item.isbn13 || item.isbn,
    title: item.title,
    author: item.author,
    publisher: item.publisher,
    coverUrl: item.cover,
    category: item.categoryName,
    pubDate: item.pubDate,
    description: item.description,
    link: item.link,
    pageCount: item.subInfo?.itemPage ?? 0,
  };
}
