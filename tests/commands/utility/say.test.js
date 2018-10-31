const Say = require('@/commands/utility/say')(global.env.BOT_DEFAULT_LANG);
const { SAY } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
const { makeContextMock } = require('../../setups/mock');


describe('Command: Say', () => {
	let context;
	beforeEach(async () => {
		context = await makeContextMock();
	});

	it('will send corect message for correct args', () => {
		context.content = '따라할 문장';
		Say.execute(context);
		expect(context.msg.reply).not.toBeCalledWith(SAY.ERROR_EMPTY_CONTENT);
	});

	it('will send error msg for insufficient args', () => {
		context.content = '';
		Say.execute(context);
		expect(context.msg.reply).toBeCalledWith(SAY.ERROR_EMPTY_CONTENT);
	});
})
