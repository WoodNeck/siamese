module.exports = {
	MESSAGE_MAX_LENGTH: 1950,
	FOOTER_MAX_LENGTH: 2048,
	DISCORD_ERROR_CODE: {
		MISSING_PERMISSION: 50013,
	},
	URL: {
		GUILD_ICON: (id, icon) => `https://cdn.discordapp.com/icons/${id}/${icon}.png`,
	},
};
