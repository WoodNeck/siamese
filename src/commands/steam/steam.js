const { loadSubcommands } = require('@/load/subcommand');
const { STEAM } = require('@/constants/commands/steam');


const steamCommands = loadSubcommands('steam');
module.exports = {
	name: STEAM.CMD,
	hidden: false,
	devOnly: false,
	subcommands: steamCommands,
	permissions: [],
};
