const { INVITE } = require('@/constants/commands/utility');


module.exports = {
	name: INVITE.CMD,
	description: INVITE.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ bot, channel }) => {
		const botMention = bot.user.toString();
		bot.generateInvite(bot.permissions.bitfield)
			.then(link => {
				channel.send(INVITE.MSG(botMention, link));
			});
	},
};
