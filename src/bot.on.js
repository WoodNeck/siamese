const { RichEmbed } = require('discord.js');
const parseArgs = require('@/helper/parseArgs');
const logMessage = require('@/helper/logMessage');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const { BOT } = require('@/constants/message');
const { HELP } = require('@/constants/commands/bot');
const { LOG_TYPE, ACTIVITY } = require('@/constants/type');


// Functions handling client.on() method


const onReady = async function() {
	this._setLogger();
	await this._setupDatabase();

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

	// Exceptions
	process.on('uncaughtException', err => this.logger.error(err));
	process.on('unhandledRejection', err => this.logger.error(err));
};

const onMessage = async function(msg) {
	const prefix = this.prefix;

	logMessage(msg);

	if (msg.author.bot) return;
	if (!msg.content.startsWith(prefix)) return;

	const cmdName = msg.content.slice(prefix.length).split(/ +/)[0];

	// No command matched
	if (!this.commands.has(cmdName)) return;

	let cmd = this.commands.get(cmdName);
	// Exclude one blank after command name
	let content = msg.content.slice(prefix.length + cmdName.length + 1);
	const subcommandName = content.split(/ +/)[0];

	// Found subcommand
	if (cmd.subcommands && cmd.subcommands.has(subcommandName)) {
		cmd = cmd.subcommands.get(subcommandName);
		content = content.slice(subcommandName.length + 1);
	}

	// Dev-only check
	if (cmd.devOnly && msg.author.id !== global.env.BOT_DEV_USER_ID) return;

	// Permissions check
	const permissionsGranted = msg.channel.permissionsFor(this.user);
	if (cmd.permissions && !cmd.permissions.every(permission => permissionsGranted.has(permission.flag))) {
		const neededPermissionList = cmd.permissions.map(permission => `- ${permission.message}`)
			.join('\n');
		msg.channel.send(ERROR.CMD.PERMISSION_IS_MISSING(neededPermissionList));
		return;
	}

	// Cooldown check
	if (cmd.cooldown) {
		const key = msg[cmd.cooldown.key].id;
		const type = cmd.cooldown.type;
		const cooldown = this.cooldowns[type];
		const prevExecuteTime = cooldown.get(key);
		if (prevExecuteTime) {
			// it's on cooldown, send inform msg
			const timeDiff = new Date() - prevExecuteTime.start;
			const diffInSeconds = (prevExecuteTime.duration - (timeDiff / 1000)).toFixed(1);
			msg.error(ERROR.CMD.ON_COOLDOWN(diffInSeconds));
			return;
		}
		else {
			// it's not on cooldown
			cooldown.set(key, {
				start: new Date(),
				duration: cmd.cooldown.time,
			});
			setTimeout(() => {
				cooldown.delete(key);
			}, cmd.cooldown.time * 1000);
		}
	}

	try {
		if (!cmd.execute) {
			// Case of subcommand-container
			// Only execute if it has execute() method
			return;
		}
		await cmd.execute({
			bot: this,
			msg: msg,
			content: content,
			author: msg.member,
			guild: msg.guild,
			channel: msg.channel,
			args: parseArgs(content),
		});
	}
	catch (err) {
		await msg.channel.stopTyping();

		msg.error(ERROR.CMD.FAILED);
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
	this.logger.error(err);
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
