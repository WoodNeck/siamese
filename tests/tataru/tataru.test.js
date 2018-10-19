const Tataru = require("@/tataru");
const { LOG } = global.CONSTANT

describe('Tataru', () => {
	let tataru;

	beforeEach(() => { tataru = new Tataru(); })

	it('can set logger', () => {
		tataru.env = {
			BOT_LOG_VERBOSE_CHANNEL: null,
			BOT_LOG_ERROR_CHANNEL: null
		};
		tataru._setLogger();
		expect(tataru.log(LOG.VERBOSE).constructor.name).toEqual('StringLog');
	});

	it('can load commands', () => {
		tataru._loadCommands();
		expect(tataru.commands.size).toBeGreaterThan(0);
	});

	it('can bind handlers for events', () => {
		expect(tataru._listenEvents.bind(tataru)).not.toThrow();
	});

	it('can setup', () => {
		expect(tataru.setup.bind(tataru)).not.toThrow();
	});

	it('can return tataru\'s display name in guild', () => {
		const displayName = '개발타루';
		const guildMock = {
			member: user => new Object(
				{ displayName: displayName }
			)
		};
		expect(tataru.getNameIn(guildMock)).toEqual(displayName)
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
			tataru = new Tataru();
			// getPrefixIn with no args returns default prefix
			expect(tataru.getPrefixIn()).toEqual(env.expected);
		});

		// reset value
		global.env.BOT_DEFAULT_PREFIX = '타타루 ';
	});
});
