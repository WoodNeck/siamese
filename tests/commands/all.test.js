const Tataru = require('@/tataru');


describe('Commands', () => {
	it('has correct meta datas', () => {
		global.botMock._loadCommands();

		const commands = global.botMock.commands.get(global.env.BOT_DEFAULT_LANG);
		commands.tap(command => {
			expect(typeof(command.name)).toBe('string');
			expect(typeof(command.description)).toBe('string');
			expect(command.usage === null || typeof(command.usage) === 'string').toBeTruthy();
			expect(typeof(command.hidden)).toBe('boolean');
			expect(typeof(command.devOnly)).toBe('boolean');
			expect(typeof(command.execute)).toBe('function');
		});
	});
});
