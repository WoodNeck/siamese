const fs = require('fs');
const path = require('path');
const { typetest, validator } = require('@/utils/typetest');


// env file exists at root folder with name 'bot.env'
const essentialConfigs = {
	BOT_TOKEN: validator.notEmptyStr,
	BOT_DEFAULT_PREFIX: validator.notEmptyStr,
	BOT_DEFAULT_LANG: validator.notEmptyStr,
};

global.env = {};
fs.readFileSync(path.join(__dirname, '../..', 'bot.env'), 'utf8')
	.split('\n')
	.filter(line => line && !line.startsWith('#'))
	.forEach(line => {
		const [key, val] = line.split('=');
		global.env[key] = val.replace(/^"(.+(?="$))"$/, '$1');
	});
typetest(global.env, essentialConfigs);
