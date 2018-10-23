const Book = require('@/utils/book');
const { EmbedPage, StringPage } = require('@/utils/page');
const { ERROR } = require('@/constants')();


describe('Book', () => {
	let book;

	beforeEach(() => {
		book = new Book();
	});

	it('has default index of 0', () => {
		expect(book._pageIdx).toEqual(0);
	});

	it('has array page', () => {
		expect(book._pages.constructor.name).toEqual('Array');
	});

	it('can add EmbedPage', () => {
		book.addPage(new EmbedPage());
		expect(book.length).toEqual(1);
		book.addPages([new EmbedPage(), new EmbedPage()]);
		expect(book.length).toEqual(3);
	});

	it('can add StringPage', () => {
		book.addPage(new StringPage());
		expect(book.length).toEqual(1);
		book.addPages([new StringPage(), new StringPage()]);
		expect(book.length).toEqual(3);
	});

	it('can\'t add non-pages', () => {
		const nonPages = [undefined, 0, null, '', () => {}, []];
		nonPages.forEach(nonPage => {
			expect(() => { book.addPage(nonPage) }).toThrow(ERROR.BOOK_CAN_ADD_ONLY_PAGE);
		});
		expect(() => { book.addPages(nonPages) }).toThrow(ERROR.BOOK_CAN_ADD_ONLY_PAGE);
	});

	it('can\'t emit page if book is empty', () => {
		expect(book.length).toEqual(0);
		expect(() => book.firstPage).toThrow(ERROR.BOOK_EMPTY);
		expect(() => book.prevPage).toThrow(ERROR.BOOK_EMPTY);
		expect(() => book.nextPage).toThrow(ERROR.BOOK_EMPTY);
	});

	it('can emit first, prev and next page correctly', () => {
		const pages = [new EmbedPage(), new StringPage(), new EmbedPage()];
		book.addPages(pages);

		expect(book.nextPage).toEqual(pages[1]);
		expect(book.nextPage).toEqual(pages[2]);
		expect(book.nextPage).toEqual(pages[0]);
		expect(book.prevPage).toEqual(pages[2]);
		expect(book.prevPage).toEqual(pages[1]);
		expect(book.firstPage).toEqual(pages[0]);
	});

	it('will automatically set footer if footer don\'t exists', () => {
		book.addPage(new EmbedPage());
		expect(book.firstPage._embed.footer.text).toEqual('1/1');
	});
});
