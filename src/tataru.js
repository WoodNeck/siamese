const path = require('path');
const chalk = require('chalk');
const { lstatSync, readdirSync } = require('fs');
const Discord = require('discord.js');
const events = require('@/tataru.on');
const Logger = require('@/utils/logger');
const { ERROR } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


class Tataru extends Discord.Client {
	constructor() {
		super();
		this._commands = new Discord.Collection();
	}

	setup() {
		this._loadCommands();
		this._listenEvents();
	}

	start() {
		this.login(global.env.BOT_TOKEN)
			.catch(console.error);
	}

	// eslint-disable-next-line
	getPrefixIn(guild) {
		return global.env.BOT_DEFAULT_PREFIX;
	}

	// eslint-disable-next-line
	getLocaleIn(guild) {
		return global.env.BOT_DEFAULT_LANG.toLowerCase();
	}

	getNameIn(guild) {
		return guild ? guild.member(this.user).displayName : this.user.username;
	}

	get commands() { return this._commands; }
	get log() { return this._logger.log.bind(this._logger); }

	_setLogger() {
		this._logger = new Logger(this, {
			verbose: global.env.BOT_LOG_VERBOSE_CHANNEL,
			error: global.env.BOT_LOG_ERROR_CHANNEL,
		});
	}

	_loadCommands() {
		const commandDirBase = path.join(__dirname, 'commands');
		const commandDirs = readdirSync(commandDirBase)
			.filter(file => lstatSync(path.join(commandDirBase, file)).isDirectory());
		const localeFiles = readdirSync(path.join(__dirname, 'locale'))
			.filter(file => file.endsWith('.js'));

		localeFiles.forEach(locale => {
			const lang = locale.split('.')[0];
			const langCommands = new Discord.Collection();

			commandDirs.forEach(dir => {
				try {
					const dirMeta = require(path.join(commandDirBase, dir, 'index.js'));

					// Load commands in dir
					readdirSync(path.join(commandDirBase, dir))
						.filter(file => file !== 'index.js')
						.forEach(cmd => {
							const command = require(`@/commands/${dir}/${cmd}`)(lang);

							command.category = dirMeta;
							langCommands.set(command.name, command);
						});
				}
				catch (err) {
					console.error(chalk.red(ERROR.CMD_CATEGORY_LOAD_FAILED(dir)));
					console.error(err);
				}
			});
			this._commands.set(lang, langCommands);
		});
	}

	_listenEvents() {
		Object.keys(events).forEach(evt => {
			const handler = events[evt];
			this.on(evt, handler.bind(this));
		});
	}
}

module.exports = Tataru;
