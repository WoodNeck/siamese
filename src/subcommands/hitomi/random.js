const axios = require('axios');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { HITOMI, HITOMI_RANDOM } = require('@/constants/commands/nsfw');
const { COOLDOWN } = require('@/constants/type');
const { AXIOS_HEADER } = require('@/constants/header');


module.exports = {
	name: HITOMI_RANDOM.CMD,
	description: HITOMI_RANDOM.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_USER(5),
	execute: async ctx => {
		const { bot, channel, msg } = ctx;
		if (!channel.nsfw) {
			msg.error(ERROR.NSFW.NOT_NSFW_CHANNEL);
			return;
		}
		await channel.startTyping();

		let articleNum = HITOMI_RANDOM.ARTICLE_NUM_MAX;

		while (articleNum >= HITOMI_RANDOM.ARTICLE_NUM_MAX) {
			articleNum = await axios.get(HITOMI_RANDOM.RANDOM_URL, {
				headers: AXIOS_HEADER,
			}).then(body => {
				// It formatted like /info/(number)
				return /\/info\/(\d+)/.exec(body.request.path)[1];
			});
		}
		await channel.stopTyping();

		ctx.content = articleNum.toString();
		const Hitomi = bot.commands.get(HITOMI.CMD);
		await Hitomi.execute(ctx);
	},
};
