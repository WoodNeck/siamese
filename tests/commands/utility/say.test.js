const Tataru = require('@/tataru');
const error = require('@/utils/error');
const Say = require('@/commands/utility/say')(global.env.BOT_DEFAULT_LANG);
const { SAY } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Say', () => {
	it('will anyway send message', () => {
		Say.execute(global.cmdObjMock);
		expect(global.cmdObjMock.channel.sendMock).toBeCalled();
	});

	it('will send corect message for correct args', () => {
		global.cmdObjMock.content = '따라할 문장';
		Say.execute(global.cmdObjMock);
		expect(global.cmdObjMock.channel.sendMock).not.toBeCalledWith(
			error(SAY.ERROR_EMPTY_CONTENT, global.cmdObjMock.locale).by(global.cmdObjMock.author)
		);
	});

	it('will send error msg for insufficient args', () => {
		global.cmdObjMock.content = '';
		Say.execute(global.cmdObjMock);
		expect(global.cmdObjMock.channel.sendMock).toBeCalledWith(
			error(SAY.ERROR_EMPTY_CONTENT, global.cmdObjMock.locale).by(global.cmdObjMock.author)
		);
	});
})
