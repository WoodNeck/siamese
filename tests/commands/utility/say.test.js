const Tataru = require('@/tataru');
const Say = require('@/commands/utility/say')(global.env.BOT_DEFAULT_LANG);
const { SAY } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Say', () => {
	it('will send corect message for correct args', () => {
		global.cmdObjMock.content = '따라할 문장';
		Say.execute(global.cmdObjMock);
		expect(global.cmdObjMock.msg.reply).not.toBeCalledWith(SAY.ERROR_EMPTY_CONTENT);
	});

	it('will send error msg for insufficient args', () => {
		global.cmdObjMock.content = '';
		Say.execute(global.cmdObjMock);
		expect(global.cmdObjMock.msg.reply).toBeCalledWith(SAY.ERROR_EMPTY_CONTENT);
	});
})
