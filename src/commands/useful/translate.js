const translate = require('@k3rn31p4nic/google-translate-api');
const { MessageEmbed } = require('discord.js');

const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { TRANSLATE } = require('@/constants/commands/useful');


module.exports = {
	name: TRANSLATE.CMD,
	description: TRANSLATE.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ channel, msg, args, content }) => {
		channel.startTyping();

		const targetLang = args[0];

		if (!(targetLang in TRANSLATE.LANGS)) {
			msg.error(ERROR.TRANSLATE.LANG_NOT_SPECIFIED);
			return;
		}

		const targetLangCode = TRANSLATE.LANGS[targetLang];
		const translateContent = content.substring(content.indexOf(' ')).trim();

		if (!translateContent.length) {
			msg.error(ERROR.TRANSLATE.NO_CONTENT);
			return;
		}

		const result = await translate(translateContent, {
			to: targetLangCode,
		});

		const embed = new MessageEmbed()
			.setDescription(`${result.text}`)
			.setFooter(`${translateContent}`)
			.setColor(COLOR.BOT);

		await channel.send(embed);
	},
};
