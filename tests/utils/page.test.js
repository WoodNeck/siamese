const { EmbedPage, StringPage } = require('@/utils/page.js');
const { invalidStrings, invalidUrls } = require('../setups/testcase')


describe('EmbedPage', () => {
	let page;
	beforeEach(() => {
		page = new EmbedPage();
	});

	it('can set title properly', () => {
		const title = '타타루 제목';
		page.setTitle(title);
		expect(page._embed.title).toEqual(title);

		invalidStrings.forEach(text => {
			page = new EmbedPage();
			page.setTitle(text);
			expect(page._embed.title).toBeUndefined();
		});
	});

	it('can set description properly', () => {
		const desc = '타타루 내용';
		page.setDescription(desc);
		expect(page._embed.description).toEqual(desc);

		invalidStrings.forEach(text => {
			page = new EmbedPage();
			page.setDescription(text);
			expect(page._embed.description).toBeUndefined();
		});
	});

	it('can set footer properly', () => {
		const footer = '타타루 각주';
		page.setFooter(footer);
		expect(page._embed.footer.text).toEqual(footer);

		invalidStrings.forEach(text => {
			page = new EmbedPage();
			page.setFooter(text);
			expect(page._embed.footer).toBeUndefined();
		});

		const validUrl = 'https://www.tataru.com/타타루/tataru.jpg';
		page.setFooter(footer, validUrl);
		expect(page._embed.footer.icon_url).toEqual(validUrl);

		invalidUrls.forEach(url => {
			page = new EmbedPage();
			page.setFooter(footer, url);
			expect(page._embed.footer.icon_url).toBeUndefined();
		})
	});

	it('can set image properly', () => {
		const imageUrl = 'https://www.tataru.com/타타루/tataru.jpeg';;
		page.setImage(imageUrl);
		expect(page._embed.image.url).toEqual(imageUrl);

		invalidStrings.forEach(text => {
			page = new EmbedPage();
			page.setImage(text);
			expect(page._embed.image).toBeUndefined();
		});

		invalidUrls.forEach(text => {
			page = new EmbedPage();
			page.setImage(text);
			expect(page._embed.image).toBeUndefined();
		});
	});

	it('can set thumbnail properly', () => {
		const thumb = 'https://some.url/to/tataru/image.png';
		page.setThumbnail(thumb);
		expect(page._embed.thumbnail.url).toEqual(thumb);

		invalidStrings.forEach(text => {
			page = new EmbedPage();
			page.setThumbnail(text);
			expect(page._embed.thumbnail).toBeUndefined();
		});

		invalidUrls.forEach(text => {
			page = new EmbedPage();
			page.setThumbnail(text);
			expect(page._embed.thumbnail).toBeUndefined();
		});
	});

	it('can set url properly', () => {
		const url = 'https://some.url/to/tataru/';
		page.setUrl(url);
		expect(page._embed.url).toEqual(url);

		invalidStrings.forEach(text => {
			page = new EmbedPage();
			page.setUrl(text);
			expect(page._embed.url).toBeUndefined();
		});

		invalidUrls.forEach(text => {
			page = new EmbedPage();
			page.setUrl(text);
			expect(page._embed.url).toBeUndefined();
		});
	});

	it('can set color', () => {
		const colors = ['#deadbf', 0xdeadbf];
		const expected = [0xdeadbf, 0xdeadbf]

		colors.forEach((col, idx) => {
			page.setColor(col);
			expect(page._embed.color).toEqual(expected[idx]);
		});
	});

	it('is embed', () => {
		expect(page.isEmbed).toEqual(true);
	});

	it('has embed content', () => {
		expect(page.content.constructor.name).toEqual('RichEmbed');
	})
});

describe('StringPage', () => {
	let page;
	beforeEach(() => {
		page = new StringPage();
	});

	it('can set title properly', () => {
		const title = '타타루 제목';
		page.setTitle(title);
		expect(page._msg.title).toEqual(title);

		invalidStrings.forEach(text => {
			page = new StringPage();
			page.setTitle(text);
			expect(page._msg.title).toBeNull();
		});
	});

	it('can set description properly', () => {
		const desc = '타타루 내용';
		page.setDescription(desc);
		expect(page._msg.desc).toEqual(desc);

		invalidStrings.forEach(text => {
			page = new StringPage();
			page.setDescription(text);
			expect(page._msg.title).toBeNull();
		});
	});

	it('can set footer properly', () => {
		const footer = '타타루 각주';
		page.setFooter(footer);
		expect(page._msg.footer).toEqual(footer);

		invalidStrings.forEach(text => {
			page = new StringPage();
			page.setFooter(text);
			expect(page._msg.footer).toBeNull();
		});
	});

	it('can\'t set image', () => {
		const image = 'https://some.url/to/tataru/image.png';
		page.setImage(image);
		expect(page._msg.image).toBeUndefined();
		expect(page._msg.imageUrl).toBeUndefined();
	});

	it('can\'t set thumbnail', () => {
		const thumb = 'https://some.url/to/tataru/image.png';
		page.setThumbnail(thumb);
		expect(page._msg.thumb).toBeUndefined();
		expect(page._msg.thumbnail).toBeUndefined();
	});

	it('can\'t set url', () => {
		const url = 'https://some.url/to/tataru/';
		page.setUrl(url);
		expect(page._msg.url).toBeUndefined();
		expect(page._msg.URL).toBeUndefined();
	});

	it('can set color', () => {
		const colors = ['#deadbf', 0xdeadbf];

		colors.forEach((col, idx) => {
			page = new StringPage();
			page.setColor(col);
			expect(page._msg.color).toEqual(col);
		});
	});

	it('is not embed', () => {
		expect(page.isEmbed).toEqual(false);
	});

	it('has content of string', () => {
		expect(typeof page.content).toEqual('string')

		page = new StringPage();
		page.setTitle('제목')
			.setDescription('내용')
			.setFooter('각주')
		expect(page.content).toEqual('제목\n내용\n각주')
	})
});
