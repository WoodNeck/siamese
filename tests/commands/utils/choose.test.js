const Tataru = require('@/tataru');
const Choose = require('@/commands/utils/choose')(global.env.BOT_DEFAULT_LANG);
const { CHOOSE } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Choose', () => {
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
			channel: {
				send: jest.fn(),
			},
			args: [],
		}
	});

	it('will anyway send message', () => {
		Choose.execute(testObj);
		expect(testObj.channel.send).toBeCalled();
	});

	it('will send corect message for correct args', () => {
		const goodArgs = ['Arg1', 'Arg2'];
		testObj.args = goodArgs;
		Choose.execute(testObj);
		expect(testObj.channel.send).not.toBeCalledWith(CHOOSE.ERROR_ARG_NOT_SUFFICIENT(testObj.author));
	});

	it('will send error msg for insufficient args', () => {
		const wrongArgs = ['Arg1'];
		testObj.args = wrongArgs;
		Choose.execute(testObj);
		expect(testObj.channel.send).toBeCalledWith(CHOOSE.ERROR_ARG_NOT_SUFFICIENT(testObj.author));
	});
})
