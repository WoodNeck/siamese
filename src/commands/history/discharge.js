const { RichEmbed } = require('discord.js');
const { loadSubcommands } = require('@/load/subcommand');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { DISCHARGE } = require('@/constants/commands/history');


module.exports = {
	name: DISCHARGE.CMD,
	description: DISCHARGE.DESC,
	usage: DISCHARGE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	subcommands: loadSubcommands('discharge'),
	execute: async ({ channel, msg }) => {

	},
};
