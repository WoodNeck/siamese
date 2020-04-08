const checkPermission = (user, guild) => guild.roles.some(
	role => role.name === global.env.FILE_MANAGEMENT_ROLE_NAME
		&& user.roles.has(role.id)
);

const hasPermission = async (bot, userId, guildId) => {
	const guild = await bot.guilds.fetch(guildId);
	const user = guild && await guild.members.fetch(userId);

	return guild && user && checkPermission(user, guild);
};

module.exports = {
	checkPermission,
	hasPermission,
};

