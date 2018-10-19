// Functions handling client.on() method
const { COLOR, LOG, DEV, BOT, ERROR, HELP } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
const { RichEmbed } = require('discord.js');

const onReady = function() {
	this._setLogger();

	this.log(LOG.VERBOSE)
		.atConsole()
		.setTitle(DEV.BOT_READY_INDICATOR)
		.setColor(COLOR.TATARU)
		.send();

	this.log(LOG.VERBOSE)
		.setTitle(BOT.READY_TITLE(this))
		.setDescription(BOT.READY_DESC(this))
		.setThumbnail(this.user.avatarURL)
		.setColor(COLOR.GOOD)
		.send();
};

const onMessage = function(msg) {
	const locale = this.getLocaleIn(msg.guild);
	const prefix = this.getPrefixIn(msg.guild);

	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	const commands = this.commands.get(locale);
	const args = msg.content.slice(prefix.length).split(/ +/);
	const cmdName = args.shift();

	if (!commands.has(cmdName)) return;

	try {
		const cmd = commands.get(cmdName);
		if (cmd.devOnly && msg.author.id !== global.env.BOT_DEV_USER_ID) return;

		cmd.execute({
			bot: this,
			msg: msg,
			guild: msg.guild,
			channel: msg.channel,
			args: args,
			locale: locale,
		});
	}
	catch (error) {
		msg.reply(BOT.CMD_FAILED);
		this.log(LOG.ERROR)
			.setTitle(ERROR.CMD_FAIL_TITLE(error))
			.setDescription(ERROR.CMD_FAIL_DESC(msg, error))
			.send();
	}
};

const onGuildJoin = function(guild) {
	if (!(guild.systemChannel)) return;
	const helpCmd = `${this.getPrefixIn(guild)}${HELP.CMD}`;
	const embedMsg = new RichEmbed().setTitle(BOT.GUILD_JOIN_TITLE(this))
		.setDescription(BOT.GUILD_JOIN_DESC(this, helpCmd))
		.setThumbnail(this.user.avatarURL)
		.setFooter(BOT.GUILD_JOIN_FOOTER(this))
		.setColor(COLOR.TATARU);
	guild.systemChannel.send(embedMsg);
};

module.exports = {
	'ready': onReady,
	'message': onMessage,
	'guildCreate': onGuildJoin,
};
