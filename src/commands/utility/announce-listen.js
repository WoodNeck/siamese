const Guild = require('~/model/guild');
const { ANNOUNCE_LISTEN } = require('~/constants/commands/utility');


module.exports = {
	name: ANNOUNCE_LISTEN.CMD,
	description: ANNOUNCE_LISTEN.DESC,
	hidden: false,
	devOnly: false,
	admin: true,
	permissions: [],
	execute: async ({ channel, guild }) => {
		const guildInfo = await Guild.findOneAndUpdate(
			{ id: guild.id },
			{},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		).exec();

		guildInfo.listenAnnounce = !guildInfo.listenAnnounce;
		await guildInfo.save();
		channel.send(
			guildInfo.listenAnnounce
				? ANNOUNCE_LISTEN.MSG_ABLE
				: ANNOUNCE_LISTEN.MSG_DISABLE
		);
	},
};
