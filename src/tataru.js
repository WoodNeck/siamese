const Discord = require('discord.js');
const chalk = require('chalk');
const events = require('@/tataru.on');
const Logger = require('@/utils/logger');
const { overrideDiscord } = require('@/prototype/discord');
const PERMISSION = require('@/constants/permission');
const { DEV } = require('@/constants/message');
const { loadAllCommands } = require('@/utils/loadcmd');


class Tataru extends Discord.Client {
	constructor() {
		super();
		// Commands handling
		this._commands = new Discord.Collection();
		// Music players
		this._players = new Discord.Collection();
		// All permissions needed to execute every single commands
		// Least permission for a bot is defined
		this._permissions = new Discord.Permissions(PERMISSION.VIEW_CHANNEL.flag);
		this._permissions.add(PERMISSION.SEND_MESSAGES.flag);
	}

	async setup() {
		// Setup bot
		await this._loadCommands();
		this._listenEvents();
		// override channel send related discord api
		overrideDiscord();
	}

	async start() {
		// Start bot
		this.login(global.env.BOT_TOKEN)
			.catch(err => {
				console.error(chalk.bold.red(DEV.BOT_FAILED_TO_START));
				console.error(chalk.dim(err));
			});
	}

	getNameIn(guild) {
		return guild ? guild.member(this.user).displayName : this.user.username;
	}

	get prefix() { return global.env.BOT_DEFAULT_PREFIX; }
	get logger() { return this._logger; }
	get commands() { return this._commands; }
	get players() { return this._players; }
	get permissions() { return this._permissions; }

	_setLogger() {
		this._logger = new Logger(this, {
			verbose: global.env.BOT_LOG_VERBOSE_CHANNEL,
			error: global.env.BOT_LOG_ERROR_CHANNEL,
		});
	}

	async _loadCommands() {
		this._commands = await loadAllCommands();
		this._commands.tap(command => {
			command.permissions.forEach(permission => {
				this._permissions.add(permission.flag);
			});
		});
		this._permissions = this._permissions.freeze();
	}

	_listenEvents() {
		Object.keys(events).forEach(evt => {
			const handler = events[evt];
			this.on(evt, handler.bind(this));
		});
	}
}

module.exports = Tataru;
