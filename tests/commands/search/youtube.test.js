const Tataru = require('@/tataru');
jest.mock('@/utils/recital');
const Recital = require('@/utils/recital');
const Youtube = require('@/commands/search/youtube')(global.env.BOT_DEFAULT_LANG);
const { SEARCH, YOUTUBE } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Youtube', () => {
	beforeEach(() => {
		global.botMock._loadCommands();
		jest.mock('axios');
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						pageInfo: {
							totalResults: 0
						},
						items: [],
					},
				});
			});
		}
	});

	it('not loadable if there\'s no API key', async () => {
		global.env.YOUTUBE_KEY = undefined;
		const isLoadable = await Youtube.checkLoadable();
		expect(isLoadable).toEqual(false);
	});

	it('is loadable when it can search videos', async () => {
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						pageInfo: {
							totalResults: 1,
						},
						items: [],
					},
				});
			});
		};

		global.env.YOUTUBE_KEY = 'SOME_TEST_KEY';
		const isLoadable = await Youtube.checkLoadable();
		expect(isLoadable).toEqual(true);
	});

	it('is not loadable when api server throws an error', async () => {
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				reject('NOPE');
			});
		};

		global.env.YOUTUBE_KEY = 'SOME_TEST_KEY';
		const isLoadable = await Youtube.checkLoadable();
		expect(isLoadable).toEqual(false);
	});

	it('will send typing annotator', async () => {
		global.cmdObjMock.content = '123';
		await Youtube.execute(global.cmdObjMock);
		expect(global.cmdObjMock.channel.typeStartMock).toBeCalled();
	});

	it('will send error to channel if msg content is empty', async () => {
		global.cmdObjMock.content = '';
		await Youtube.execute(global.cmdObjMock);
		expect(global.cmdObjMock.msg.reply).toBeCalledWith(SEARCH.ERROR_EMPTY_CONTENT);
	});

	it('will send error to channel if video is not found', async () => {
		global.cmdObjMock.content = '123';
		jest.mock('axios');
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						pageInfo: {
							totalResults: 0
						},
						items: [],
					},
				});
			});
		}
		await Youtube.execute(global.cmdObjMock);
		expect(global.cmdObjMock.msg.reply).toBeCalledWith(SEARCH.ERROR_EMPTY_RESULT(YOUTUBE.TARGET));
	});

	it('will start recital session if video found', async () => {
		global.cmdObjMock.content = '123';
		jest.mock('axios');
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: {
						pageInfo: {
							totalResults: 1
						},
						items: [{
							id: {
								videoId: '426'
							},
							contentDetails: {
								duration: 'PT4M13S',
							},
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
		await Youtube.execute(global.cmdObjMock);
		expect(Recital.prototype.start).toBeCalledWith(YOUTUBE.RECITAL_TIME);
		expect(global.channelMock.typeStopMock);
	})
})
