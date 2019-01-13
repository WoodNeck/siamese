const axios = require('axios');
const PERMISSION = require('@/constants/permission');
const { NAMUWIKI, NAMUWIKI_RANDOM } = require('@/constants/commands/search');
const { AXIOS_HEADER } = require('@/constants/header');
const { COOLDOWN } = require('@/constants/type');


module.exports = {
	name: NAMUWIKI_RANDOM.CMD,
	description: NAMUWIKI_RANDOM.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_USER(5),
	execute: async (ctx) => {
		await ctx.channel.startTyping();
		const documentName = await axios.get(NAMUWIKI_RANDOM.RANDOM_URL, {
			headers: AXIOS_HEADER,
		}).then(body => {
			const doc = /\/w\/((.+)(\?from=.+)$|.+)/.exec(body.request.path);
			// If ?from= exists, captured by group 2, else 1
			return decodeURIComponent(doc[2] ? doc[2] : doc[1]);
		});
		ctx.content = documentName;

		await ctx.channel.stopTyping();

		const Namuwiki = ctx.bot.commands.get(NAMUWIKI.CMD);
		Namuwiki.execute(ctx);
	},
};
