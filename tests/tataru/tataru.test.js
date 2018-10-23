const Tataru = require("@/tataru");
const { LOG } = global.CONSTANT

describe('Tataru', () => {
	it('can set logger', () => {
		global.botMock._setLogger();
		expect(global.botMock.log(LOG.VERBOSE).constructor.name).toEqual('StringLog');
	});

	it('can load commands', () => {
		global.botMock._loadCommands();
		expect(global.botMock.commands.size).toBeGreaterThan(0);
	});

	it('can bind handlers for events', () => {
		expect(global.botMock._listenEvents.bind(global.botMock)).not.toThrow();
	});

	it('can setup', () => {
		expect(global.botMock.setup.bind(global.botMock)).not.toThrow();
	});

	it('can return tataru\'s display name in guild', () => {
		const displayName = '개발타루';
		const guildMock = {
			member: user => new Object(
				{ displayName: displayName }
			)
		};
		expect(global.botMock.getNameIn(guildMock)).toEqual(displayName)
	});

	it('can set good prefixes properly', () => {
		const acceptablePrefixes = [
			{ prefix: '$', expected: '$' },
			{ prefix: '타타루 ', expected: '타타루 ' },
			{ prefix: '+', expected: '+' },
			{ prefix: 't!', expected: 't!' },
			{ prefix: ' tataru ', expected: ' tataru ' },
		];

		acceptablePrefixes.forEach(env => {
			global.env.BOT_DEFAULT_PREFIX = env.prefix;
			global.botMock = new Tataru();
			// getPrefixIn with no args returns default prefix
			expect(global.botMock.getPrefixIn()).toEqual(env.expected);
		});
	});
});
