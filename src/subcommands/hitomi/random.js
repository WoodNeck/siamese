const axios = require('axios');
const NodeCache = require('node-cache');
const { jspack } = require('jspack');
const CACHE = require('@/constants/cache');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { HITOMI, HITOMI_RANDOM } = require('@/constants/commands/nsfw');
const { COOLDOWN } = require('@/constants/type');
const { AXIOS_HEADER } = require('@/constants/header');


const indexCache = new NodeCache({
	stdTTL: CACHE.HITOMI.RANDOM_INDEX.ttl,
	checkperiod: CACHE.HITOMI.RANDOM_INDEX.checkPeriod,
});

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
	cooldown: COOLDOWN.PER_USER(3),
	execute: async ctx => {
		const { bot, channel, msg } = ctx;
		if (!channel.nsfw) {
			msg.error(ERROR.NSFW.NOT_NSFW_CHANNEL);
			return;
		}
		await channel.startTyping();

		let indexArray = indexCache.get('indexArray');
		if (!indexArray) {
			await axios.get(HITOMI_RANDOM.INDEX_URL, {
				headers: AXIOS_HEADER,
				responseType: 'arraybuffer',
			}).then(body => {
				const octetArr = new Uint8Array(body.data);
				// 32-bit unsigned integers
				const total = octetArr.length / 4;
				indexArray = jspack.Unpack(`${total}I`, octetArr);
				indexCache.set('indexArray', indexArray);
			});
		}

		await channel.stopTyping();

		const randomArticleNum = indexArray.random();
		ctx.content = randomArticleNum.toString();
		const Hitomi = bot.commands.get(HITOMI.CMD);
		await Hitomi.execute(ctx);
	},
};
