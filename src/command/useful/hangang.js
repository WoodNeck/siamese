const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const COLOR = require('~/const/color');
const ERROR = require('~/const/error');
const PERMISSION = require('~/const/permission');
const { HANGANG } = require('~/const/commands/useful');


module.exports = {
	name: HANGANG.CMD,
	description: HANGANG.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ msg, channel }) => {
		channel.startTyping();

		const info = await axios.get(HANGANG.URL)
			.then(body => body.data)
			.catch(() => null);

		if (!info || !info.result) {
			msg.error(ERROR.SEARCH.FAILED);
			return;
		}

		const temperature = info.temp;
		const time = new Date(HANGANG.DATE(info.time));

		const embed = new MessageEmbed()
			.setDescription(HANGANG.RESULT(temperature))
			.setColor(COLOR.BOT)
			.setTimestamp(time);

		await channel.send(embed);
	},
};
