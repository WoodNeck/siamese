const checkPermission = (user, guild) => guild.roles.some(
	role => role.name === global.env.FILE_MANAGEMENT_ROLE_NAME
		&& user.roles.has(role.id)
);

module.exports = {
	checkPermission,
};

