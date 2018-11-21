const NodeCache = require('node-cache');
const { RichEmbed } = require('discord.js');
const { getUserId } = require('@/helper/steam');
const Steam = require('@/helper/steam');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { STEAM, RANDOM } = require('@/constants/commands/steam');


const gamesCache = new NodeCache({
	stdTTL: RANDOM.CACHE_TTL,
});
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
		await channel.startTyping();

		let ownedGames = gamesCache.get(content);
		if (!ownedGames) {
			// Find out 64-bit encoded steamid
			const searchText = content;
			const userId = await getUserId(searchText);

			if (!userId) {
				msg.error(ERROR.STEAM.USER_NOT_FOUND);
				return;
			}
			ownedGames = await Steam.getOwnedGames(userId, true);
			gamesCache.set(content, ownedGames);
		}
		if (!ownedGames || !ownedGames.game_count) {
			msg.error(ERROR.STEAM.EMPTY_GAMES);
			return;
		}

		const randomGame = ownedGames.games.random();
		const embed = new RichEmbed()
			.setAuthor(randomGame.name, STEAM.GAME_IMG_URL(randomGame.appid, randomGame.img_icon_url))
			.setThumbnail(STEAM.GAME_IMG_URL(randomGame.appid, randomGame.img_logo_url))
			.setDescription(RANDOM.PLAYTIME(randomGame.playtime_forever))
			.setColor(COLOR.BOT);
		channel.send(embed);
	},
};
