const Choose = require('@/commands/utility/choose')(global.env.BOT_DEFAULT_LANG);
const { CHOOSE } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
const { makeBotMock, makeContextMock } = require('../../setups/mock');


describe('Command: Choose', () => {
	let context;
	beforeEach(async () => {
		context = await makeContextMock();
	});

	it('will send corect message for correct args', () => {
		const goodArgs = ['Arg1', 'Arg2'];
		context.args = goodArgs;
		Choose.execute(context);
		expect(context.msg.reply).not.toBeCalledWith(CHOOSE.ERROR_ARG_NOT_SUFFICIENT);
	});

	it('will send error msg for insufficient args', () => {
		const wrongArgs = ['Arg1'];
		context.args = wrongArgs;
		Choose.execute(context);
		expect(context.msg.reply).toBeCalledWith(CHOOSE.ERROR_ARG_NOT_SUFFICIENT);
	});
})
