const { loadSubcommands } = require('~/load/subcommand');
const { STEAM } = require('~/const/commands/steam');


module.exports = {
	name: STEAM.CMD,
	hidden: false,
	devOnly: false,
	subcommands: loadSubcommands('steam'),
	permissions: [],
};
