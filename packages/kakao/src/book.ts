import axios, { type AxiosResponse } from "axios";
import { decode } from "html-entities";

import { BOOK_SEARCH_PARAMS, BOOK_SEARCH_URL, KAKAO_HEADER } from "./const";

interface BookAPIResult {
  meta: {
    is_end: boolean;
    pageable_count: number;
    total_count: number;
  };
  documents: Book[];
}

interface Book {
  title: string;
  thumbnail: string;
  url: string;
  datetime: string;
  authors: string[];
  translators: string[];
  contents: string;
  publisher: string;
  price: number;
  status: string;
  sale_price: number;
  isbn: string;
}

const searchBooks = async (searchText: string) => {
  const { data } = await axios.get(BOOK_SEARCH_URL, {
    params: BOOK_SEARCH_PARAMS(searchText),
    headers: KAKAO_HEADER
  }) as AxiosResponse<BookAPIResult>;

  const { documents: books } = data;

  return books.map(book => ({
    ...book,
    contents: decode(book.contents)
  }));
};

export {
  searchBooks
};
