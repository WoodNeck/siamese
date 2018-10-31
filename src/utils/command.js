const path = require('path');
const chalk = require('chalk');
const Discord = require('discord.js');
const { lstatSync, readdirSync } = require('fs');
const { ERROR } = require('@/constants')(global.env.BOT_DEFAULT_LANG);

const localeDirBase = path.join(__dirname, '..', 'locale');
const commandDirBase = path.join(__dirname, '..', 'commands');

const loadAllCommands = async () => {
	const localeFiles = readdirSync(localeDirBase)
		.filter(file => file.endsWith('.js'))
		.map(locale => locale.split('.')[0]);
	const allCommands = new Discord.Collection();
	for (const lang of localeFiles) {
		const langCommands = await loadLocale(lang);
		allCommands.set(lang, langCommands);
	}
	return allCommands;
};

const loadLocale = async lang => {
	const langCommands = new Discord.Collection();
	const commandDirs = readdirSync(commandDirBase)
		.filter(file => lstatSync(path.join(commandDirBase, file)).isDirectory());

	for (const category of commandDirs) {
		await loadCategory(category, lang, langCommands);
	}

	return langCommands;
};

const loadCategory = async (category, lang, langCommands) => {
	try {
		const dirMeta = require(path.join(commandDirBase, category, 'index.js'));

		// Load commands in dir
		const commands = readdirSync(path.join(commandDirBase, category))
			.filter(file => file !== 'index.js')
			.map(cmd => `@/commands/${category}/${cmd}`);
		for (const cmd of commands) {
			const command = await loadCommand(cmd, lang);
			if (command) {
				command.category = dirMeta;
				langCommands.set(command.name, command);
			}
		}
	}
	catch (err) {
		console.error(chalk.red(ERROR.CMD_CATEGORY_LOAD_FAILED(category)));
		console.error(err);
	}
};

const loadCommand = async (cmd, lang) => {
	try {
		const command = require(cmd)(lang);
		const isLoadable = command.checkLoadable
			? await command.checkLoadable()
			: true;
		if (isLoadable) {
			return command;
		}
		else {
			console.error(chalk.red(ERROR.CMD_LOAD_FAILED(command.name)));
		}
	}
	catch (err) {
		console.error(chalk.red(ERROR.CMD_LOAD_FAILED(`${cmd}(${lang})`)));
		console.error(err);
	}
};

module.exports = {
	loadAllCommands: loadAllCommands,
	loadLocale: loadLocale,
	loadCategory: loadCategory,
	loadCommand: loadCommand,
};
