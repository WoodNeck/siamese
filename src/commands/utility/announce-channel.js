const Guild = require('~/model/guild');
const PERMISSION = require('~/const/permission');
const { ANNOUNCE_CHANNEL } = require('~/const/commands/utility');


module.exports = {
	name: ANNOUNCE_CHANNEL.CMD,
	description: ANNOUNCE_CHANNEL.DESC,
	hidden: false,
	devOnly: false,
	admin: true,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ channel, guild }) => {
		const guildInfo = await Guild.findOneAndUpdate(
			{ id: guild.id },
			{},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		).exec();

		if (!guildInfo.announceChannel || guildInfo.announceChannel !== channel.id) {
			guildInfo.announceChannel = channel.id;
			await guildInfo.save();
			channel.send(ANNOUNCE_CHANNEL.MSG_SET(channel));
		}
		else {
			guildInfo.announceChannel = undefined;
			await guildInfo.save();
			channel.send(ANNOUNCE_CHANNEL.MSG_DELETE);
		}
	},
};
