require('dotenv').config();
const { cleanEnv, makeValidator, bool } = require('envalid');
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const events = require('@/tataru.on');
const Logger = require('@/utils/logger');
const { ERROR } = require('@/constants');


class Tataru extends Discord.Client {
	setup() {
		this._loadEnvironment();
		this._loadCommands();
		this._listenEvents();
	}

	start() {
		this.login(this.env.BOT_TOKEN)
			.catch(console.error);
	}

	getNameIn(guild) {
		return guild ? guild.member(this.user).displayName : this.user.username;
	}

	get log() { return this._logger.log.bind(this._logger); }

	_loadEnvironment() {
		const notEmptyStr = makeValidator(str => {
			// it also handles consecutive blanks
			if (str && str.trim()) {
				return str.trim();
			}
			else {
				throw new TypeError(ERROR.ENV_VAR_NO_EMPTY_STRING);
			}
		});

		this.env = cleanEnv(process.env, {
			BOT_PREFIX: notEmptyStr(),
			BOT_PREFIX_TRAILING_SPACE: bool(),
			BOT_TOKEN: notEmptyStr(),
			BOT_LANG: notEmptyStr(),
		});

		this.prefix = !this.env.BOT_PREFIX_TRAILING_SPACE ?
			this.env.BOT_PREFIX : `${this.env.BOT_PREFIX} `;
	}

	_setLogger() {
		this._logger = new Logger(this, {
			verbose: this.env.BOT_LOG_VERBOSE_CHANNEL,
			error: this.env.BOT_LOG_ERROR_CHANNEL,
		});
	}

	_loadCommands() {
		this.commands = new Discord.Collection();
		const commandFiles = fs.readdirSync(path.join(__dirname, 'commands'))
			.filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`@/commands/${file}`);
			this.commands.set(command.name, command);
		}
	}

	_listenEvents() {
		Object.keys(events).forEach(evt => {
			const handler = events[evt];
			this.on(evt, handler.bind(this));
		});
	}
}

module.exports = Tataru;
