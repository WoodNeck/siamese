const chalk = require('chalk');
const dedent = require('~/utils/dedent');
const COLOR = require('~/constants/color');
const ERROR = require('~/constants/error');
const { LOG_TYPE } = require('~/constants/type');
const { EmbedPage, StringPage } = require('~/utils/page');

module.exports = class Logger {
	async setChannels(bot, channelIds = {
		verbose: null,
		error: null,
	}) {
		const verboseChannel = await bot.channels.fetch(channelIds.verbose);
		const errorChannel = await bot.channels.fetch(channelIds.error);
		this._channels = {
			VERBOSE: verboseChannel,
			ERROR: errorChannel,
		};
	}

	log(mode) {
		if (!(mode in LOG_TYPE)) {
			throw new Error(ERROR.LOGGER.TYPE_NOT_DEFINED(mode));
		}
		return (this._channels[mode])
			? new EmbedLog(mode, this._channels[mode])
			: new StringLog(mode);
	}

	// Helper function for formatted error logging
	error(err, msg) {
		const mode = LOG_TYPE.ERROR;
		const log = (this._channels[mode])
			? new EmbedLog(mode, this._channels[mode])
			: new StringLog(mode);
		msg
			? log.setTitle(ERROR.CMD.FAIL_TITLE(err))
				.setDescription(dedent`
					${ERROR.CMD.FAIL_PLACE(msg)}
					${ERROR.CMD.FAIL_CMD(msg)}
					${ERROR.CMD.FAIL_DESC(err)}`)
			: log.setTitle(ERROR.CMD.FAIL_TITLE(err))
				.setDescription(ERROR.CMD.FAIL_DESC(err));
		log.send();
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
		return this._channel.send(this._embed)
			.catch(err => console.error(err));
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
