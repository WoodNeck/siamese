const path = require('path');
const chalk = require('chalk');
const Discord = require('discord.js');
const { readdirSync } = require('fs');
const ERROR = require('~/const/error');


const subcommandRoot = path.join(__dirname, '..', 'subcommands');
const loadSubcommands = commandName => {
	const subcommands = new Discord.Collection();
	const subcommandDir = path.join(subcommandRoot, commandName);

	readdirSync(subcommandDir)
		.forEach(cmd => {
			try {
				const subcommand = require(path.join(subcommandDir, cmd));
				subcommands.set(subcommand.name, subcommand);
			}
			catch (err) {
				console.error(chalk.red(ERROR.CMD.SUB_LOAD_FAILED(commandName, cmd)));
				console.error(err);
			}
		});

	return subcommands;
};

module.exports = {
	loadSubcommands: loadSubcommands,
};
