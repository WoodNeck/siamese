const { INVITE } = require('@/constants');


module.exports = {
	name: INVITE.CMD,
	description: INVITE.DESC,
	usage: null,
	hidden: false,
	devOnly: false,
	execute: ({ bot, channel }) => {
		const botMention = bot.user.toString();
		bot.generateInvite(['ADMINISTRATOR'])
			.then(link => {
				channel.send(INVITE.MSG(botMention, link));
			});
	},
};
