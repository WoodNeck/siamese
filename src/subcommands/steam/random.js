const { MessageEmbed } = require('discord.js');
const { getUserId, getOwningGames } = require('~/helper/steam');
const COLOR = require('~/constants/color');
const ERROR = require('~/constants/error');
const PERMISSION = require('~/constants/permission');
const { STEAM, RANDOM } = require('~/constants/commands/steam');


module.exports = {
	name: RANDOM.CMD,
	description: RANDOM.DESC,
	usage: RANDOM.USAGE,
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

		const searchText = content;
		const userId = await getUserId(searchText);
		if (!userId) {
			msg.error(ERROR.STEAM.USER_NOT_FOUND);
			return;
		}

		const owningGames = await getOwningGames(userId, true);
		if (!owningGames || !owningGames.game_count) {
			msg.error(ERROR.STEAM.EMPTY_GAMES);
			return;
		}

		const randomGame = owningGames.games.random();
		const embed = new MessageEmbed()
			.setAuthor(randomGame.name, STEAM.GAME_IMG_URL(randomGame.appid, randomGame.img_icon_url))
			.setThumbnail(STEAM.GAME_IMG_URL(randomGame.appid, randomGame.img_logo_url))
			.setDescription(STEAM.PLAYTIME(randomGame.playtime_forever))
			.setColor(COLOR.BOT);
		channel.send(embed);
	},
};
