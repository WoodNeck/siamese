const { MessageEmbed } = require('discord.js');
const parseArgs = require('@/helper/parseArgs');
const logMessage = require('@/helper/logMessage');
const logCommand = require('@/helper/logCommand');
const checkImageCommand = require('@/helper/checkImageCommand');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
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
		.setThumbnail(this.user.avatarURL())
		.setColor(COLOR.GOOD)
		.send();

	// Set default activity
	const activity = `${global.env.BOT_DEFAULT_PREFIX}${HELP.CMD}${EMOJI.CAT.GRINNING}`;
	this.user.setActivity(activity, {
		type: ACTIVITY.LISTENING,
	});

	// Exceptions
	process.on('uncaughtException', err => {
		console.error(err);
		this.logger.error(err);
	});
	process.on('unhandledRejection', err => {
		console.error(err);
		this.logger.error(err);
	});

	// Discord bot lists update interval setting
	if (this._dbl) {
		// Update immediately
		this._dbl.postStats(this.guilds.size);
		// Update every 30 minute
		setInterval(() => {
			this._dbl.postStats(this.guilds.size);
		}, 30 * 60 * 1000);
	}
};

const onMessage = async function(msg) {
	const prefix = this.prefix;

	// Log message per channel, for history-related commands
	logMessage(msg);

	if (msg.author.bot) return;
	if (!msg.content.startsWith(prefix)) return checkImageCommand(this, msg);

	let cmdName = msg.content.slice(prefix.length).split(/ +/)[0];

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
		cmdName = `${cmdName} ${cmd.name}`;
	}

	// Dev-only check
	if (cmd.devOnly && msg.author.id !== global.env.BOT_DEV_USER_ID) return;

	// Channel type check
	if (!msg.channel.permissionsFor) {
		msg.error(ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
		return;
	}

	// Admin permission check
	if (cmd.admin && !msg.channel.permissionsFor(msg.member).has(PERMISSION.ADMINISTRATOR.flag)) {
		msg.error(ERROR.CMD.USER_SHOULD_BE_ADMIN);
		return;
	}

	// Permissions check
	const permissionsGranted = msg.channel.permissionsFor(this.user);
	if (cmd.permissions && !cmd.permissions.every(permission => permissionsGranted.has(permission.flag))) {
		if (permissionsGranted.has(PERMISSION.SEND_MESSAGES.flag)) {
			const neededPermissionList = cmd.permissions.map(permission => `- ${permission.message}`)
				.join('\n');
			msg.channel.send(ERROR.CMD.PERMISSION_IS_MISSING(this, neededPermissionList));
		}
		else if (permissionsGranted.has(PERMISSION.ADD_REACTIONS.flag)) {
			msg.react(EMOJI.CROSS);
		}
		return;
	}

	// Cooldown check
	if (cmd.cooldown) {
		const key = `${msg[cmd.cooldown.key].id}${cmdName}`;
		const prevExecuteTime = this.cooldowns.get(key);
		if (prevExecuteTime) {
			// it's on cooldown, send inform msg
			const timeDiff = new Date() - prevExecuteTime.start;
			const diffInSeconds = (prevExecuteTime.duration - (timeDiff / 1000)).toFixed(1);
			msg.error(ERROR.CMD.ON_COOLDOWN(diffInSeconds));
			return;
		}
		else {
			// it's not on cooldown
			this.cooldowns.set(key, {
				start: new Date(),
				duration: cmd.cooldown.time,
			});
			setTimeout(() => {
				this.cooldowns.delete(key);
			}, cmd.cooldown.time * 1000);
		}
	}

	try {
		if (!cmd.execute) {
			// Case of subcommand-container
			// Only execute if it has execute() method
			return;
		}
		const cmdTimeStart = new Date().getTime();
		await cmd.execute({
			bot: this,
			msg: msg,
			content: content,
			author: msg.member,
			guild: msg.guild,
			channel: msg.channel,
			args: parseArgs(content),
		});
		const cmdTimeEnd = new Date().getTime();
		if (!cmd.devOnly && !cmd.hidden) logCommand(cmdName, msg, cmdTimeEnd - cmdTimeStart);
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
	const embedMsg = new MessageEmbed().setTitle(BOT.GUILD_JOIN_TITLE)
		.setDescription(BOT.GUILD_JOIN_DESC(this, helpCmd))
		.setThumbnail(this.user.avatarURL())
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
