const Discord = require('discord.js');
const chalk = require('chalk');
const events = require('@/bot.on');
const Logger = require('@/utils/logger');
const { loadDatabase } = require('@/load/db');
const { loadAllCommands } = require('@/load/command');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { COOLDOWN } = require('@/constants/type');


class Bot extends Discord.Client {
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
		// Cooldowns, per type
		this._cooldowns = {};
		for (const type in COOLDOWN.TYPE) {
			this._cooldowns[type] = new Discord.Collection();
		}
	}

	async setup() {
		// Setup bot
		await this._loadCommands();
		this._listenEvents();
	}

	async start() {
		// Start bot
		this.login(global.env.BOT_TOKEN)
			.catch(err => {
				console.error(chalk.bold.red(ERROR.BOT.FAILED_TO_START));
				console.error(chalk.dim(err));
			});
	}

	getNameIn(guild) {
		return guild ? guild.member(this.user).displayName : this.user.username;
	}

	get db() { return this._db; }
	get prefix() { return global.env.BOT_DEFAULT_PREFIX; }
	get logger() { return this._logger; }
	get commands() { return this._commands; }
	get players() { return this._players; }
	get permissions() { return this._permissions; }
	get cooldowns() { return this._cooldowns; }

	// Used in ready event
	_setLogger() {
		this._logger = new Logger(this, {
			verbose: global.env.BOT_LOG_VERBOSE_CHANNEL,
			error: global.env.BOT_LOG_ERROR_CHANNEL,
		});
	}

	// Used in ready event, as logger should be provided
	async _setupDatabase() {
		this._db = await loadDatabase(this);
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

module.exports = Bot;
