const Tataru = require('@/tataru');
jest.mock('@/utils/recital');
const Recital = require('@/utils/recital');
const Image = require('@/commands/search/image')(global.env.BOT_DEFAULT_LANG);
const { SEARCH, IMAGE } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Image', () => {
	beforeEach(() => {
		global.botMock._loadCommands();
	});

	it('will send typing annotator', async () => {
		global.cmdObjMock.content = '123';
		await Image.execute(global.cmdObjMock);
		expect(global.cmdObjMock.channel.typeStartMock).toBeCalled();
	});

	it('will send error to channel if msg content is empty', async () => {
		global.cmdObjMock.content = '';
		await Image.execute(global.cmdObjMock);
		expect(global.cmdObjMock.msg.reply).toBeCalledWith(SEARCH.ERROR_EMPTY_CONTENT);
	});

	it('will send error to channel if image is not found', async () => {
		global.cmdObjMock.content = '123';
		jest.mock('axios');
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: '',
				});
				reject();
			});
		}
		await Image.execute(global.cmdObjMock);
		expect(global.cmdObjMock.msg.reply).toBeCalledWith(SEARCH.ERROR_EMPTY_RESULT(IMAGE.TARGET));
	});

	it('will start recital session if image found', async () => {
		global.cmdObjMock.content = '123';
		jest.mock('axios');
		const axios = require('axios');
		axios.get = () => {
			return new Promise((resolve, reject) => {
				resolve({
					data: '<div class="random_class"></div><a><div><div class="rg_meta">{"ou":"https://i.ytimg.com/vi/3RywqqJkM8I/maxresdefault.jpg","ow":1920,"pt":"Learning Numbers | Counting 123 | 1 to 10 | Fun and Creative ..."}</div></div></a>',
				});
				reject();
			});
		}
		const Book = require('@/utils/book');
		Recital.constructor = function () {
			this.book = new Book();
		}
		Recital.prototype.start = jest.fn();
		await Image.execute(global.cmdObjMock);
		expect(Recital.prototype.start).toBeCalledWith(IMAGE.RECITAL_TIME);
		expect(global.channelMock.typeStopMock);
	})
})
