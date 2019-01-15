const axios = require('axios');
const { RichEmbed } = require('discord.js');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { HANGANG } = require('@/constants/commands/useful');


module.exports = {
	name: HANGANG.CMD,
	description: HANGANG.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ msg, channel }) => {
		await channel.startTyping();

		const info = await axios.get(HANGANG.URL)
			.then(body => body.data)
			.catch(() => null);

		if (!info || !info.result) {
			msg.error(ERROR.SEARCH.FAILED);
			return;
		}

		const temperature = info.temp;
		const time = new Date(info.time);

		const embed = new RichEmbed()
			.setDescription(HANGANG.RESULT(temperature))
			.setColor(COLOR.BOT)
			.setTimestamp(time);

		await channel.send(embed);
	},
};
