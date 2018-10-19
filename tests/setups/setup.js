// Default: test 'kr' lang
global.env = {
	BOT_TOKEN: 'TATARU',
	BOT_DEFAULT_PREFIX: '타타루 ',
	BOT_DEFAULT_LANG: 'kr',

	BOT_VERBOSE_CHANNEL: 1,
	BOT_ERROR_CHANNEL: 2,
};
global.CONSTANT = require('@/constants')(global.env.BOT_DEFAULT_LANG);
global.console = {
	log: global.console.log,
	dir: global.console.dir,
	// Disable console.error message
	error: jest.fn(),
};
