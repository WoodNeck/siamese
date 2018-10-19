const chalk = require('chalk');
const { DEV } = require('@/constants')();


const typetest = (target, checkList) => {
	for (const key in checkList) {
		if (!target[key]) {
			throw new Error(chalk.red(DEV.ENV_VAR_MISSING(key)));
		}
		const val = target[key];
		const validator = checkList[key];
		if (!(validator.validate(val))) {
			throw new TypeError(chalk.red(`${validator.error} "${key}"`));
		}
	}
};

const notEmptyStr = {
	validate: val => val && val.trim(),
	error: DEV.ENV_VAR_NO_EMPTY_STRING,
};

module.exports = {
	typetest: typetest,
	validator: {
		notEmptyStr: notEmptyStr,
	},
};
