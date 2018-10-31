jest.mock('@/utils/recital');
const Recital = require('@/utils/recital');
const Kin = require('@/commands/search/kin')(global.env.BOT_DEFAULT_LANG);
const { SEARCH, KIN } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
const { makeContextMock } = require('../../setups/mock');


describe('Command: Kin', () => {
	let context;
	beforeEach(async () => {
		context = await makeContextMock();

		global.env.NAVER_ID = 123;
		global.env.NAVER_SECRET = 123;

		jest.mock('axios');
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						total: 0,
					},
				});
			});
		}
	});

	it('not loadable if there\'s no API key', async () => {
		global.env.NAVER_ID = undefined;
		global.env.NAVER_SECRET = undefined;
		let isLoadable = await Kin.checkLoadable();
		expect(isLoadable).toEqual(false);

		global.env.NAVER_ID = 123;
		global.env.NAVER_SECRET = undefined;
		isLoadable = await Kin.checkLoadable();
		expect(isLoadable).toEqual(false);

		global.env.NAVER_ID = undefined;
		global.env.NAVER_SECRET = 123;
		isLoadable = await Kin.checkLoadable();
		expect(isLoadable).toEqual(false);
	});

	it('is loadable when it can search results', async () => {
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						total: 1
					},
				});
			});
		};

		const isLoadable = await Kin.checkLoadable();
		expect(isLoadable).toEqual(true);
	});

	it('is not loadable when api server throws an error', async () => {
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				reject('NOPE');
			});
		};

		const isLoadable = await Kin.checkLoadable();
		expect(isLoadable).toEqual(false);
	});

	it('will send typing annotator', async () => {
		context.content = '123';
		await Kin.execute(context);
		expect(context.channel.startTyping).toBeCalled();
	});

	it('will send error to channel if msg content is empty', async () => {
		context.content = '';
		await Kin.execute(context);
		expect(context.msg.reply).toBeCalledWith(SEARCH.ERROR_EMPTY_CONTENT);
	});

	it('will send error to channel if result is not found', async () => {
		context.content = '123';
		jest.mock('axios');
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						total: 0,
						items: [],
					},
				});
			});
		}
		await Kin.execute(context);
		expect(context.msg.reply).toBeCalledWith(SEARCH.ERROR_EMPTY_RESULT(KIN.TARGET));
	});

	it('will start recital session if result is found', async () => {
		context.content = '123';
		jest.mock('axios');
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						total: 1,
						items: [{
							title: '디스코드 봇 타타루가 뭔가요?',
							description: '타타루에용~~',
						}],
					},
				});
				reject();
			});
		}
		const Book = require('@/utils/book');
		Recital.constructor = function () {
			this.book = new Book();
		}
		Recital.prototype.start = jest.fn();
		await Kin.execute(context);
		expect(Recital.prototype.start).toBeCalledWith(KIN.RECITAL_TIME);
		expect(context.channel.stopTyping).toBeCalled();
	});
})
