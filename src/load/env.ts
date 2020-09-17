import fs from "fs";
import path from "path";
import { typetest, validator } from "~/utils/typetest";

const env: {[key: string]: string} = {};

// env file exists at root folder with name 'bot.env'
fs.readFileSync(path.join(__dirname, '../..', 'bot.env'), 'utf8')
	.split('\n')
	.filter(line => line && !line.startsWith('#'))
	.forEach(line => {
		const [key, val] = line.split('=');
		env[key] = val.replace(/^"(.+(?="$))"$/, '$1');
	});

const essentialConfigs = {
	BOT_TOKEN: validator.notEmptyStr,
	BOT_DEFAULT_PREFIX: validator.notEmptyStr,
};
typetest(env, essentialConfigs);

export default Object.freeze(env);
