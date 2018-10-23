const chalk = require('chalk');
const { COLOR, ERROR, LOG } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
const { EmbedPage, StringPage } = require('@/utils/page');

module.exports = class Logger {
	constructor(bot, channelIds = {
		verbose: null,
		error: null,
	}) {
		const verboseChannel = bot.channels.has(channelIds.verbose) ?
			bot.channels.get(channelIds.verbose) : null;
		const errorChannel = bot.channels.has(channelIds.error) ?
			bot.channels.get(channelIds.error) : null;
		this._channels = {
			VERBOSE: verboseChannel,
			ERROR: errorChannel,
		};
	}

	log(mode) {
		if (!(mode in LOG)) {
			throw new Error(ERROR.LOG_MODE_NOT_DEFINED(mode));
		}
		return (this._channels[mode])
			? new EmbedLog(mode, this._channels[mode])
			: new StringLog(mode);
	}
};

class EmbedLog extends EmbedPage {
	constructor(mode, channel) {
		super();
		this._mode = mode;
		this._channel = channel;
	}
	atConsole() {
		const log = new StringLog(this._mode);

		if (this._embed.title) log.setTitle(this._embed.title);
		if (this._embed.description) log.setDescription(this._embed.description);
		if (this._embed.color) {
			log.setColor(`#${this._embed.color.toString(16)}`);
		}

		return log;
	}
	send() {
		if (!this._embed.color) this._embed.setColor(COLOR[this._mode]);
		this._embed.setTimestamp(new Date());
		this._channel.send(this._embed);
	}
}

class StringLog extends StringPage {
	constructor(mode) {
		super();
		this._mode = mode;
	}
	atConsole() {
		// DO NOTHING
		return this;
	}
	send() {
		const timeStamp = new Date().toLocaleString();
		console.log(chalk.white.dim(`[${timeStamp}]`));
		if (!this._msg.color) this.setColor(COLOR[this._mode]);
		if (this._msg.title) {
			console.log(chalk.hex(this._msg.color).bold(this._msg.title));
		}
		if (this._msg.desc) {
			console.log(chalk.white(this._msg.desc));
		}
	}
}
