const { MANAGE } = require('@/constants/commands/file');


module.exports = {
	name: MANAGE.CMD,
	description: MANAGE.DESC,
	hidden: true,
	devOnly: false,
	permissions: [],
	execute: ({ guild, channel }) => {
		const baseURL = global.env.FILE_MANAGEMENT_URL;
		channel.send(`${baseURL}/file/${guild.id}`);
	},
};
