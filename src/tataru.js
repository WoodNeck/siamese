require('dotenv').config();
const { cleanEnv, makeValidator, bool } = require('envalid');
const fs = require('fs');
const Discord = require('discord.js');
const events = require('./tataru.on');
const { DEV } = require('./constants');

class Tataru extends Discord.Client {
	setup() {
		this._loadEnvironment();
		this._loadCommands();
		this._listenEvents();
	}

	start() {
		this.login(process.env.BOT_TOKEN)
			.catch(console.error);
	}

	_loadEnvironment() {
		const notEmptyStr = makeValidator(str => {
			// it also handles consecutive blanks
			if (str && str.trim()) {
				return str.trim();
			}
			else {
				throw new Error(DEV.ENV_VAR_NO_EMPTY_STRING);
			}
		});

		this.env = cleanEnv(process.env, {
			BOT_PREFIX: notEmptyStr(),
			BOT_PREFIX_TRAILING_SPACE: bool(),
			BOT_TOKEN: notEmptyStr(),
		});

		this.prefix = !this.env.BOT_PREFIX_TRAILING_SPACE ?
			this.env.BOT_PREFIX : `${this.env.BOT_PREFIX} `;
	}

	_loadCommands() {
		this.commands = new Discord.Collection();
		const commandFiles = fs.readdirSync('./src/commands')
			.filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);
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
