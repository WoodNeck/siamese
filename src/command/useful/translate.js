const translate = require('@k3rn31p4nic/google-translate-api');
const { MessageEmbed } = require('discord.js');

const { loadSubcommands } = require('~/load/subcommand');
const COLOR = require('~/const/color');
const EMOJI = require('~/const/emoji');
const ERROR = require('~/const/error');
const PERMISSION = require('~/const/permission');
const { TRANSLATE } = require('~/const/commands/useful');


module.exports = {
	name: TRANSLATE.CMD,
	description: TRANSLATE.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	subcommands: loadSubcommands('translate'),
	execute: async ({ channel, msg, args, content }) => {
		channel.startTyping();

		const langCandidate = args[0];
		const targetLang = langCandidate in TRANSLATE.LANGS
			? langCandidate
			: TRANSLATE.DEFAULT_LANG;
		const targetLangCode = TRANSLATE.LANGS[targetLang];
		const translateContent = langCandidate in TRANSLATE.LANGS
			? content.substring(content.indexOf(' ')).trim()
			: content;

		if (!translateContent.length) {
			msg.error(ERROR.TRANSLATE.NO_CONTENT);
			return;
		}

		const result = await translate(translateContent, {
			to: targetLangCode,
		});
		const langISO = result.from.language.iso.toLowerCase();
		const originalLang = Object.keys(TRANSLATE.LANGS).find(lang => {
			return TRANSLATE.LANGS[lang] === langISO;
		});

		const embed = new MessageEmbed()
			.setDescription(`${EMOJI.MEMO} ${result.text}`)
			.setFooter(`${EMOJI.WWW}${originalLang}: ${translateContent}`)
			.setColor(COLOR.BOT);

		await channel.send(embed);
	},
};
