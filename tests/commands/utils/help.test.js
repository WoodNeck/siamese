const Tataru = require('@/tataru');
const Help = require('@/commands/utils/help')(global.env.BOT_DEFAULT_LANG);


describe('Command: Help', () => {
	it('will send help message', () => {
		const tataru = new Tataru();
		tataru._loadCommands();

		const sendMock = jest.fn();
		const channel = {
			send: sendMock
		};

		Help.execute({
			bot: tataru,
			channel: channel,
			locale: global.env.BOT_DEFAULT_LANG,
		});
		expect(sendMock).toBeCalled();
	});
})
