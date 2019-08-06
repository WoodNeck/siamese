const checkPermission = (user, guild) => guild.roles.some(
	role => role.name === global.env.FILE_MANAGEMENT_ROLE_NAME
		&& user.roles.has(role.id)
);

const hasPermission = (bot, userId, guildId) => {
	const guild = bot.guilds.get(guildId);
	const user = guild && guild.members.get(userId);

	return guild && user && checkPermission(user, guild);
};

module.exports = {
	checkPermission,
	hasPermission,
};

