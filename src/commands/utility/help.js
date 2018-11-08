const { Collection, RichEmbed } = require('discord.js');
const EMOJI = require('@/constants/emoji');
const COLOR = require('@/constants/color');
const PERMISSION = require('@/constants/permission');
const { strong, block } = require('@/utils/markdown.js');
const { HELP } = require('@/constants/command');

module.exports = {
	name: HELP.CMD,
	description: HELP.DESC,
	hidden: false,
	devOnly: false,
	permissions: [PERMISSION.EMBED_LINKS],
	execute: async ({ bot, channel }) => {
		const allCommands = bot.commands.filter(cmd => !cmd.devOnly && !cmd.hidden);
		const prefix = bot.prefix;

		const categories = allCommands
			.reduce((categoryCollection, cmd) => {
				const category = cmd.category.name;
				categoryCollection.has(category)
					? categoryCollection.get(category).push(cmd)
					: categoryCollection.set(category, [cmd]);
				return categoryCollection;
			}, new Collection())
			.filter(commands => commands.length);

		for (const commands of categories.values()) {
			const category = commands[0].category;
			// Set description also to prevent multiline command description
			const msg = new RichEmbed()
				.setDescription(`${category.categoryEmoji} ${strong(category.name)}\n${category.description}`)
				.setColor(COLOR.TATARU);

			commands.forEach(cmd => {
				// Works whether space exist in prefix or not
				const commandTitle = strong(`${category.commandEmoji} ${cmd.name}`);
				const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name}`, cmd.usage].filter(str => str).join(' ');
				msg.addField(commandTitle, `${commandUsage}\n${block(cmd.description)}`);
			});
			await channel.send(msg);
		}
	},
};
