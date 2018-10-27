// Initial Setting
const resetSettings = () => {
	global.env = {
		BOT_TOKEN: 'TATARU',
		BOT_DEFAULT_PREFIX: '타타루 ',
		// Default: test 'kr' lang
		BOT_DEFAULT_LANG: 'kr',

		BOT_VERBOSE_CHANNEL: 1,
		BOT_ERROR_CHANNEL: 2,
	};

	// Mock axios, so make it won't send network message
	jest.mock('axios');
	const axios = require('axios');
	axios.get = () => {
		return new Promise((resolve, reject) => {
			resolve({
				data: 'DATA_OF_MOCKUP',
			});
			reject();
		});
	};

	// Mock console functions to prevent logging
	global.logSpy = jest.spyOn(global.console, 'log')
		.mockImplementation(() => {});
	global.errorSpy = jest.spyOn(global.console, 'error')
		.mockImplementation(() => {});
};

resetSettings();

module.exports = {
	resetSettings: resetSettings,
};
