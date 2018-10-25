const Tataru = require('@/tataru');
const Choose = require('@/commands/utility/choose')(global.env.BOT_DEFAULT_LANG);
const { CHOOSE } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Choose', () => {
	beforeEach(() => {
		global.botMock._loadCommands();
	});

	it('will send corect message for correct args', () => {
		const goodArgs = ['Arg1', 'Arg2'];
		global.cmdObjMock.args = goodArgs;
		Choose.execute(global.cmdObjMock);
		expect(global.cmdObjMock.msg.reply).not.toBeCalledWith(CHOOSE.ERROR_ARG_NOT_SUFFICIENT);
	});

	it('will send error msg for insufficient args', () => {
		const wrongArgs = ['Arg1'];
		global.cmdObjMock.args = wrongArgs;
		Choose.execute(global.cmdObjMock);
		expect(global.cmdObjMock.msg.reply).toBeCalledWith(CHOOSE.ERROR_ARG_NOT_SUFFICIENT);
	});
})
