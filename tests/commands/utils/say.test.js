const Tataru = require('@/tataru');
const Say = require('@/commands/utils/say')(global.env.BOT_DEFAULT_LANG);
const { SAY } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Say', () => {
	let tataru;
	let testObj;
	beforeEach(() => {
		tataru = new Tataru();
		tataru._loadCommands();
		testObj = {
			bot: tataru,
			author: {
				toString: () => '타타루',
			},
			msg: {
				delete: jest.fn(),
			},
			channel: {
				send: jest.fn(),
			},
			content: null,
		}
	});

	it('will anyway send message', () => {
		Say.execute(testObj);
		expect(testObj.channel.send).toBeCalled();
	});

	it('will send corect message for correct args', () => {
		testObj.content = '따라할 문장';
		Say.execute(testObj);
		expect(testObj.channel.send).not.toBeCalledWith(SAY.ERROR_EMPTY_CONTENT(testObj.author));
	});

	it('will send error msg for insufficient args', () => {
		testObj.args = '';
		Say.execute(testObj);
		expect(testObj.channel.send).toBeCalledWith(SAY.ERROR_EMPTY_CONTENT(testObj.author));
	});
})
