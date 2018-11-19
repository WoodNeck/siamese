const { RichEmbed } = require('discord.js');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const Channel = require('@/model/channel');
const DB = require('@/constants/db');
const { BOT } = require('@/constants/message');
const { HELP } = require('@/constants/commands/utility');
const { LOG_TYPE, ACTIVITY } = require('@/constants/type');


// Functions handling client.on() method


const onReady = async function() {
	this._setLogger();
	await this._setUpDatabase();

	this.logger.log(LOG_TYPE.VERBOSE)
		.atConsole()
		.setTitle(BOT.READY_INDICATOR(this))
		.setColor(COLOR.BOT)
		.send();

	this.logger.log(LOG_TYPE.VERBOSE)
		.setTitle(BOT.READY_TITLE(this))
		.setDescription(BOT.READY_DESC(this))
		.setThumbnail(this.user.avatarURL)
		.setColor(COLOR.GOOD)
		.send();

	// Set default activity
	const activity = `${global.env.BOT_DEFAULT_PREFIX}${HELP.CMD}`;
	this.user.setActivity(activity, {
		type: ACTIVITY.LISTENING,
	});
};

const onMessage = async function(msg) {
	const prefix = this.prefix;

	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	const args = msg.content.slice(prefix.length).split(/ +/);
	const cmdName = args.shift();

	// No command matched
	if (!this.commands.has(cmdName)) return;

	const cmd = this.commands.get(cmdName);
	// Check whether it's dev-only command
	if (cmd.devOnly && msg.author.id !== global.env.BOT_DEV_USER_ID) return;

	// Check permission to execute command
	const permissionsGranted = msg.channel.permissionsFor(this.user);
	if (cmd.permissions && !cmd.permissions.every(permission => permissionsGranted.has(permission.flag))) {
		const neededPermissionList = cmd.permissions.reduce((prevStr, permission) => {
			return `${prevStr}\n- ${permission.message}`;
		}, '');
		msg.channel.send(ERROR.CMD.PERMISSION_IS_MISSING(neededPermissionList));
		return;
	}

	// Save the messages per channel, for later use for msg fetching
	const channel = await Channel.findOneAndUpdate(
		{ id: msg.channel.id },
		{ '$inc': { msgCnt: 1 } },
		{ upsert: true, new: true, setDefaultsOnInsert: true }
	).exec()
		.catch(err => this.logger.error(err, msg));

	// index starts with 1, as incr happens automatically every time
	if (channel.msgCnt % DB.MSG_SAVE_INTERVAL === 1) {
		channel.msgCnt = 1;
		channel.msgs.snowflakes.set(channel.msgs.index, msg.id);
		channel.msgs.index = channel.msgs.index + 1 < DB.MSG_SAVE_PER_CHANNEL
			? channel.msgs.index + 1
			: 0;
		channel.save();
	}

	// Exclude one blank after command name
	const content = msg.content.slice(prefix.length + cmdName.length + 1);
	try {
		await cmd.execute({
			bot: this,
			msg: msg,
			content: content,
			author: msg.member,
			guild: msg.guild,
			channel: msg.channel,
			args: args,
		});
	}
	catch (err) {
		await msg.channel.stopTyping();

		msg.channel.send(ERROR.CMD.FAILED);
		this.logger.error(err, msg);
	}
};

const onGuildJoin = function(guild) {
	if (!(guild.systemChannel)) return;
	const helpCmd = `${this.prefix}${HELP.CMD}`;
	const embedMsg = new RichEmbed().setTitle(BOT.GUILD_JOIN_TITLE)
		.setDescription(BOT.GUILD_JOIN_DESC(this, helpCmd))
		.setThumbnail(this.user.avatarURL)
		.setFooter(BOT.GUILD_JOIN_FOOTER(this))
		.setColor(COLOR.BOT);
	guild.systemChannel.send(embedMsg);
};

const onError = function(err) {
	// Known error
	if (err.message === 'read ECONNRESET') return;
	this.logger.log(LOG_TYPE.ERROR)
		.setTitle(ERROR.CMD.FAIL_TITLE(err))
		.setDescription(ERROR.CMD.FAIL_DESC(err))
		.send();
};

const onWarning = function(info) {
	this.logger.log(LOG_TYPE.VERBOSE)
		.setTitle(`${EMOJI.WARNING} WARNING`)
		.setDescription(info.toString())
		.setColor(COLOR.WARNING)
		.send();
};

module.exports = {
	ready: onReady,
	message: onMessage,
	guildCreate: onGuildJoin,
	error: onError,
	warn: onWarning,
};
