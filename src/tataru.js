const Discord = require('discord.js');
const events = require('@/tataru.on');
const Logger = require('@/utils/logger');
const { loadAllCommands } = require('@/utils/command');


class Tataru extends Discord.Client {
	constructor() {
		super();
		this._commands = new Discord.Collection();
	}

	async start() {
		// Setup bot
		await this._loadCommands();
		this._listenEvents();

		// Start bot
		this.login(global.env.BOT_TOKEN)
			.catch(console.error);
	}

	// eslint-disable-next-line
	getPrefixIn(guild) {
		// TODO: FIX AFTER DB SETUP
		return global.env.BOT_DEFAULT_PREFIX;
	}

	// eslint-disable-next-line
	getLocaleIn(guild) {
		// TODO: FIX AFTER DB SETUP
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
