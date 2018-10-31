const fs = require('fs');
const path = require('path');


global.env = {};
// env file exists at root folder with name 'bot.env'
fs.readFileSync(path.join(__dirname, '../..', 'bot.env'), 'utf8')
	.split('\n')
	.filter(line => line && !line.startsWith('#'))
	.forEach(line => {
		const [key, val] = line.split('=');
		global.env[key] = val.replace(/^"(.+(?="$))"$/, '$1');
	});

const { typetest, validator } = require('@/utils/typetest');
const essentialConfigs = {
	BOT_TOKEN: validator.notEmptyStr,
	BOT_DEFAULT_PREFIX: validator.notEmptyStr,
	BOT_DEFAULT_LANG: validator.notEmptyStr,
};
typetest(global.env, essentialConfigs);

global.env = Object.freeze(global.env);
