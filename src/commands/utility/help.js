const { Collection } = require('discord.js');
const EMOJI = require('@/constants/emoji');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const { strong, block } = require('@/utils/markdown.js');
const COLOR = require('@/constants/color');
const PERMISSION = require('@/constants/permission');
const { HELP } = require('@/constants/commands/utility');

module.exports = {
	name: HELP.CMD,
	description: HELP.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	execute: async ({ bot, msg }) => {
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
			.filter(commands => commands.length)
			.map(commands => {
				const category = commands[0].category;
				const embed = new EmbedPage()
					.setDescription(`${category.categoryEmoji} ${strong(category.name)}\n${category.description}`)
					.setColor(COLOR.BOT);
				commands.forEach(cmd => {
					if (cmd.execute) {
						// Works whether space exist in prefix or not
						const commandTitle = strong(`${category.commandEmoji} ${cmd.name}`);
						const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name}`, cmd.usage].filter(str => str).join(' ');
						embed.addField(commandTitle, `${commandUsage}\n${block(cmd.description)}`);
					}
					if (cmd.subcommands) {
						cmd.subcommands.tap(subcmd => {
							const commandTitle = strong(`${category.commandEmoji} ${cmd.name} ${subcmd.name}`);
							const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name} ${subcmd.name}`, subcmd.usage].filter(str => str).join(' ');
							embed.addField(commandTitle, `${commandUsage}\n${block(subcmd.description)}`);
						});
					}
				});
				return embed;
			});

		const recital = new Recital(bot, msg);
		recital.book.addPages(categories);
		recital.start(HELP.RECITAL_TIME);
	},
};
