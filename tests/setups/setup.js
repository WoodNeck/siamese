// Default: test 'kr' lang
process.env.BOT_LANG = 'kr';

global.CONSTANT = require('@/constants');
global.console = {
	log: global.console.log,
	dir: global.console.dir,
	// Disable console.error message
	error: jest.fn(),
};
