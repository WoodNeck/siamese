const { loadSubcommands } = require('~/load/subcommand');
const { WOW } = require('~/constants/commands/game');


module.exports = {
	name: WOW.CMD,
	hidden: false,
	devOnly: false,
	subcommands: loadSubcommands('wow'),
	permissions: [],
};
