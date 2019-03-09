const ERROR = require('@/constants/error');
const { PAGE } = require('@/constants/format');


// Collection of sendable pages
module.exports = class Book {
	constructor() {
		this._pageIdx = 0;
		this._pages = [];
	}
	addPage(page) {
		if (!this._isPage(page)) {
			throw new Error(ERROR.BOOK.CAN_ADD_ONLY_PAGE);
		}

		this._pages.push(page);
		return this;
	}
	addPages(pages) {
		if (!pages.every(page => this._isPage(page))) {
			throw new Error(ERROR.BOOK.CAN_ADD_ONLY_PAGE);
		}

		this._pages.push(...pages);
		return this;
	}
	get length() { return this._pages.length; }
	get currentPage() {
		return this._currentPage();
	}
	get prevPage() {
		this._pageIdx = this._pageIdx > 0 ? this._pageIdx - 1 : this.length - 1;
		return this._currentPage();
	}
	get nextPage() {
		this._pageIdx = this._pageIdx < this.length - 1 ? this._pageIdx + 1 : 0;
		return this._currentPage();
	}
	get firstPage() {
		this._pageIdx = 0;
		return this._currentPage();
	}
	get currentData() {
		const currentPage = this._pages[this._pageIdx];
		return currentPage.data;
	}
	_currentPage() {
		if (!this.length) {
			throw new Error(ERROR.BOOK.ENTRY_IS_EMPTY);
		}
		const currentPage = this._pages[this._pageIdx];
		if (currentPage.isEmbed) {
			if (currentPage.content.footer) {
				currentPage.content.footer.text = currentPage.content.footer.text
					.replace(PAGE.CURRENT, (this._pageIdx + 1).toString())
					.replace(PAGE.TOTAL, this.length.toString());
			}
			else {
				currentPage.setFooter(`${this._pageIdx + 1}/${this.length}`);
			}
		}
		return currentPage;
	}
	_isPage(page) {
		return page
			&& page.constructor
			&& ['EmbedPage', 'StringPage'].some(pageName => page.constructor.name === pageName);
	}
};
