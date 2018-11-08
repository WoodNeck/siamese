const path = require('path');
const chalk = require('chalk');
const Discord = require('discord.js');
const { DEV } = require('@/constants/message');
const { lstatSync, readdirSync } = require('fs');


const commandDirBase = path.join(__dirname, '..', 'commands');

const loadAllCommands = async () => {
	const commands = new Discord.Collection();
	const commandDirs = readdirSync(commandDirBase)
		.filter(file => lstatSync(path.join(commandDirBase, file)).isDirectory());

	for (const category of commandDirs) {
		await loadCategory(category, commands);
	}

	return commands;
};

const loadCategory = async (category, commands) => {
	try {
		const dirMeta = require(path.join(commandDirBase, category, 'index.js'));

		// Load commands in dir
		const commandFiles = readdirSync(path.join(commandDirBase, category))
			.filter(file => file !== 'index.js')
			.map(cmd => `@/commands/${category}/${cmd}`);
		for (const cmd of commandFiles) {
			const command = await loadCommand(cmd);
			if (command) {
				command.category = dirMeta;
				commands.set(command.name, command);
			}
		}
	}
	catch (err) {
		console.error(chalk.red(DEV.CMD_CATEGORY_LOAD_FAILED(category)));
		console.error(err);
	}
};

const loadCommand = async cmd => {
	try {
		const command = require(cmd);
		if (command.checkLoadable) {
			await command.checkLoadable();
		}
		return command;
	}
	catch (err) {
		console.error(chalk.red(DEV.CMD_LOAD_FAILED(`${cmd}`)));
		console.error(chalk.dim(err));
	}
};

module.exports = {
	loadAllCommands: loadAllCommands,
	loadCategory: loadCategory,
	loadCommand: loadCommand,
};
