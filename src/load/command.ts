import path from "path";
import chalk from "chalk";
import Discord from "discord.js";
import { lstatSync, readdirSync } from "fs";
import ERROR from "~/consts/error";
import Command from "~/commands/Command";

const commandRoot = path.join(__dirname, "..", "commands");

const loadAllCommands = async (): Promise<Discord.Collection<string, Command>> => {
	const commands = new Discord.Collection<string, Command>();
	const commandDirs = readdirSync(commandRoot)
		.filter(file => lstatSync(path.join(commandRoot, file)).isDirectory());

	for (const category of commandDirs) {
		await loadCategory(category, commands);
	}

	return commands;
};

const loadCategory = async (category: string, commands: Discord.Collection<string, Command>): Promise<void> => {
	try {
		const dirMeta = require(path.join(commandRoot, category, "index.js"));

		// Load commands in dir
		const commandFiles = readdirSync(path.join(commandRoot, category))
			.filter(file => file !== "index.js")
			.map(cmd => `~/commands/${category}/${cmd}`);
		for (const cmd of commandFiles) {
			const command = await loadCommand(cmd);
			if (command) {
				command.category = dirMeta;
				commands.set(command.name, command);
			}
		}
	}
	catch (err) {
		console.error(chalk.red(ERROR.CMD.CATEGORY_LOAD_FAILED(category)));
		console.error(err);
	}
};

const loadCommand = async (cmd: string): Promise<Command | undefined> => {
	try {
		return require(cmd) as Command;
	}
	catch (err) {
		console.error(chalk.red(ERROR.CMD.LOAD_FAILED(`${cmd}`)));
		console.error(chalk.dim(err));
	}
};

module.exports = {
	loadAllCommands: loadAllCommands,
	loadCategory: loadCategory,
	loadCommand: loadCommand,
};
