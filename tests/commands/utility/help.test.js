const Tataru = require('@/tataru');
const Help = require('@/commands/utility/help')(global.env.BOT_DEFAULT_LANG);
const { makeContextMock } = require('../../setups/mock');


describe('Command: Help', () => {
	it('will send help message', async () => {
		const context = await makeContextMock();
		await Help.execute(context);
		expect(context.channel.send).toBeCalled();
	});
})
