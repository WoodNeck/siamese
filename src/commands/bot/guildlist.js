const { MESSAGE_MAX_LENGTH } = require('@/constants/discord');
const { GUILDLIST } = require('@/constants/commands/bot');


module.exports = {
	name: GUILDLIST.CMD,
	devOnly: true,
	permissions: [],
	execute: async ({ bot, channel }) => {
		const guilds = bot.guilds;

		let guildsStr = '';
		for (const guild of guilds.values()) {
			const guildEntry = GUILDLIST.GUILD_ENTRY(guild);
			if (guildsStr.length + guildEntry.length > MESSAGE_MAX_LENGTH) {
				await channel.send(guildsStr);
				guildsStr = '';
			}
			else {
				guildsStr = `${guildsStr}\n${guildEntry}`;
			}
		}

		if (guildsStr.length) {
			await channel.send(guildsStr);
		}
	},
};
