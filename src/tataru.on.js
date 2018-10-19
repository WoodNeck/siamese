// Functions handling client.on() method
const Fuse = require('fuse.js');
const Hangul = require('hangul-js');
const { COLOR, LOG, DEV, BOT, HELP } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
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

	// Set default activity
	const activity = `${global.env.BOT_DEFAULT_PREFIX}${HELP.CMD}`;
	this.user.setActivity(activity, {
		type: 'LISTENING',
	});
};

const onMessage = async function(msg) {
	const locale = this.getLocaleIn(msg.guild);
	const prefix = this.getPrefixIn(msg.guild);

	if (!msg.content.startsWith(prefix) || msg.author.bot) return;

	const commands = this.commands.get(locale);
	const args = msg.content.slice(prefix.length).split(/ +/);
	const cmdName = args.shift();

	if (!commands.has(cmdName)) {
		// Do fuzzy matching, to check whether similar command exists
		const cmdDisassembled = Hangul.disassemble(cmdName).join('');
		const fuse = new Fuse(commands.array().map(cmd => Hangul.disassemble(cmd.name).join('')), {
			shouldSort: true,
			includeScore: true,
		});
		const matches = fuse.search(cmdDisassembled);
		if (matches.length) {
			const match = matches[0];
			const cmdMatched = commands.array()[match.item];

			msg.channel.send(BOT.CMD_INFORM_SIMILAR(msg.author, cmdMatched.name));
		}
		return;
	}

	try {
		const cmd = commands.get(cmdName);
		const content = msg.content.slice(prefix.length + cmdName.length);
		if (cmd.devOnly && msg.author.id !== global.env.BOT_DEV_USER_ID) return;

		cmd.execute({
			bot: this,
			msg: msg,
			content: content,
			author: msg.author,
			guild: msg.guild,
			channel: msg.channel,
			args: args,
			locale: locale,
		});
	}
	catch (error) {
		msg.reply(BOT.CMD_FAILED);
		this.log(LOG.ERROR)
			.setTitle(DEV.CMD_FAIL_TITLE(error))
			.setDescription(DEV.CMD_FAIL_DESC(msg, error))
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
