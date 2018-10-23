const Tataru = require('@/tataru');
const Help = require('@/commands/utility/help')(global.env.BOT_DEFAULT_LANG);


describe('Command: Help', () => {
	it('will send help message', () => {
		global.botMock._loadCommands();
		Help.execute(global.cmdObjMock);
		expect(global.cmdObjMock.channel.sendMock).toBeCalled();
	});
})
