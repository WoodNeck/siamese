const { RichEmbed } = require('discord.js');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { CURRENT } = require('@/constants/commands/music');
const { PLAYER } = require('@/constants/message');
const { PLAYER_STATE_EMOJI } = require('@/constants/type');

module.exports = {
	name: CURRENT.CMD,
	description: CURRENT.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: ({ msg, bot, guild, channel }) => {
		if (!bot.players.has(guild.id)) {
			msg.error(ERROR.MUSIC.NO_PLAYERS_AVAILABLE);
			return;
		}
		const player = bot.players.get(guild.id);
		const song = player.currentSong;
		const progressed = player.time;
		const statusEmoji = PLAYER_STATE_EMOJI[player.state];
		const embed = new RichEmbed()
			.setDescription(`${PLAYER.SONG_TITLE(song)}\n${song.duration ? PLAYER.SONG_PROGRESS(song, progressed, statusEmoji, player.loop) : ''}`)
			.setFooter(song.member.displayName, song.member.user.avatarURL)
			.setColor(COLOR.BOT);

		channel.send(embed);
	},
};
