const { loadSubcommands } = require('~/load/subcommand');
const { LOL } = require('~/constants/commands/game');


module.exports = {
	name: LOL.CMD,
	hidden: false,
	devOnly: false,
	subcommands: loadSubcommands('lol'),
	permissions: [],
};
