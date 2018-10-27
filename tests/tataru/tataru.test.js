const { LOG } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
const { makeBotMock, makeGuildMock } = require('../setups/mock');

describe('Tataru', () => {
	let tataru;
	beforeEach(() => {
		tataru = makeBotMock();
	});

	it('can set logger', () => {
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
		const guild = makeGuildMock();
		guild.member = user => new Object({ displayName: displayName });
		expect(tataru.getNameIn(guild)).toEqual(displayName)
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
			tataru = makeBotMock();
			// getPrefixIn with no args returns default prefix
			expect(tataru.getPrefixIn()).toEqual(env.expected);
		});
	});
});
