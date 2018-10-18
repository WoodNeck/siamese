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
			{ prefix: '$', space: '0', expected: '$' },
			{ prefix: '타타루', space: '1', expected: '타타루 ' },
			{ prefix: '+', space: 'true', expected: '+ ' },
			{ prefix: 't!', space: 'false', expected: 't!' },
			{ prefix: 'tataru ', space: 't', expected: 'tataru ' }, // trim test
			{ prefix: ' $ ', space: 'f', expected: '$' }, // trim test
		];

		acceptablePrefixes.forEach(env => {
			tataru = new Tataru();
			process.env.BOT_PREFIX = env.prefix;
			process.env.BOT_PREFIX_TRAILING_SPACE = env.space;
			expect(tataru._loadEnvironment.bind(tataru)).not.toThrow();
			expect(tataru.prefix).toEqual(env.expected);
		});
	});
});
