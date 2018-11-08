const Discord = require('discord.js');
const chalk = require('chalk');
const events = require('@/tataru.on');
const Logger = require('@/utils/logger');
const { overrideSend } = require('@/prototype/discord');
const { DEV } = require('@/constants/message');
const { loadAllCommands } = require('@/utils/loadcmd');


class Tataru extends Discord.Client {
	constructor() {
		super();
		// Commands handling
		this._commands = new Discord.Collection();
		// Music players
		this._players = new Discord.Collection();
	}

	async setup() {
		// Setup bot
		await this._loadCommands();
		this._listenEvents();
		// override channel send related discord api
		overrideSend();
	}

	async start() {
		// Start bot
		this.login(global.env.BOT_TOKEN)
			.catch(err => {
				console.error(chalk.bold.red(DEV.BOT_FAILED_TO_START));
				console.error(chalk.dim(err));
			});
	}

	// eslint-disable-next-line
	getPrefixIn(guild) {
		// TODO: FIX AFTER DB SETUP
		return global.env.BOT_DEFAULT_PREFIX;
	}

	getNameIn(guild) {
		return guild ? guild.member(this.user).displayName : this.user.username;
	}

	get logger() { return this._logger; }
	get commands() { return this._commands; }
	get players() { return this._players; }

	_setLogger() {
		this._logger = new Logger(this, {
			verbose: global.env.BOT_LOG_VERBOSE_CHANNEL,
			error: global.env.BOT_LOG_ERROR_CHANNEL,
		});
	}

	async _loadCommands() {
		this._commands = await loadAllCommands();
	}

	_listenEvents() {
		Object.keys(events).forEach(evt => {
			const handler = events[evt];
			this.on(evt, handler.bind(this));
		});
	}
}

module.exports = Tataru;
