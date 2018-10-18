const Tataru = require("@/tataru");
const Help = require("@/commands/help");


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
			channel: channel
		});
		expect(sendMock).toBeCalled();
	});
})
