const { Collection, RichEmbed } = require('discord.js');
const { code, block } = require('@/utils/markdown.js');

module.exports = lang => {
	const { HELP, COLOR } = require('@/constants')(lang);

	return {
		name: HELP.CMD,
		description: HELP.DESC,
		usage: null,
		hidden: false,
		devOnly: false,
		execute: async ({ bot, guild, channel, locale }) => {
			const allCommands = bot.commands.get(locale).filter(cmd => !cmd.devOnly && !cmd.hidden);
			const prefix = bot.getPrefixIn(guild);

			const categories = allCommands
				.reduce((categoryCollection, cmd) => {
					const category = cmd.category(locale).name;
					categoryCollection.has(category)
						? categoryCollection.get(category).push(cmd)
						: categoryCollection.set(category, [cmd]);
					return categoryCollection;
				}, new Collection())
				.filter(commands => commands.length);

			for (const commands of categories.values()) {
				const category = commands[0].category(locale);
				// Set description also to prevent multiline command description
				const msg = new RichEmbed().setTitle(`${category.categoryEmoji}${category.name}`)
					.setDescription(category.description)
					.setColor(COLOR.TATARU);

				commands.forEach(cmd => {
					// Works whether space exist in prefix or not
					const commandUsage = [`${prefix}${cmd.name}`, cmd.usage].filter(str => str)
						.join(' ')
						.split(' ')
						.map(str => code(str))
						.join(' ');
					const commandTitle = `${category.commandEmoji}${cmd.name} ${commandUsage}`;
					msg.addField(commandTitle, block(cmd.description));
				});
				await channel.send(msg);
			}
		},
	};
};
