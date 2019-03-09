const { MessageEmbed } = require('discord.js');
const { getGame, getCurrentPlayers } = require('@/helper/steam');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { STEAM, PLAYERS } = require('@/constants/commands/steam');


module.exports = {
	name: PLAYERS.CMD,
	description: PLAYERS.DESC,
	usage: PLAYERS.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ msg, channel, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		channel.startTyping();

		const game = await getGame(content);
		if (!game) {
			msg.error(ERROR.SEARCH.EMPTY_RESULT(PLAYERS.TARGET));
			return;
		}

		const currentPlayers = await getCurrentPlayers(game.id);

		const embed = new MessageEmbed()
			.setTitle(game.name)
			.setDescription(PLAYERS.CURRENT(currentPlayers))
			.setURL(STEAM.STORE_URL(game.id))
			.setColor(COLOR.BOT);
		if (game.tiny_image) {
			embed.setThumbnail(game.tiny_image);
		}
		channel.send(embed);
	},
};
