const { HELP, EMOJI } = require('@/constants');
const { block } = require('@/utils/markdown.js');


module.exports = {
	name: HELP.CMD,
	description: HELP.DESC,
	usage: null,
	hidden: false,
	devOnly: false,
	execute: ({ bot, channel }) => {
		const commands = bot.commands.filter(cmd => !cmd.devOnly && !cmd.hidden);
		const msg = [];
		const prefix = bot.prefix;

		commands.tap(cmd => {
			msg.push(`${EMOJI.BLUE_DIAMOND} ${cmd.name}`);
			if (cmd.usage) msg.push(`  ${EMOJI.LOUD_SPEAKER} ${prefix}${cmd.name} ${cmd.usage}`);
			msg.push(`  - ${cmd.description}`);
		});

		channel.send(block(msg.join('\n')));
	},
};
