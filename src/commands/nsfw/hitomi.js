const axios = require('axios');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');
const { loadSubcommands } = require('@/load/subcommand');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { HITOMI } = require('@/constants/commands/nsfw');
const { COOLDOWN } = require('@/constants/type');
const { AXIOS_HEADER } = require('@/constants/header');


module.exports = {
	name: HITOMI.CMD,
	description: HITOMI.DESC,
	usage: HITOMI.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	subcommands: loadSubcommands('hitomi'),
	cooldown: COOLDOWN.PER_USER(5),
	execute: async ({ channel, msg, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}

		if (!channel.nsfw) {
			msg.error(ERROR.NSFW.NOT_NSFW_CHANNEL);
			return;
		}

		if (!/^[0-9]*$/.test(content)) {
			msg.error(ERROR.NSFW.HITOMI_PROVIDE_INTEGER_ONLY);
			return;
		}

		channel.startTyping();

		const articleNum = parseInt(content, 10);

		// All errors, like 404 error will return undefined
		let article = await axios.get(HITOMI.ARTICLE_URL(articleNum), {
			headers: AXIOS_HEADER,
		}).then(body => body.data)
			.catch(() => undefined);

		if (!article) {
			msg.error(ERROR.NSFW.HITOMI_NUM_NOT_VALID);
			return;
		}

		const meta = {};
		let $ = cheerio.load(article);

		// Check redirection
		let redirectionUrl;
		const pageMeta = $('meta');
		pageMeta.each((idx, el) => {
			const element = $(el);
			const redirectionInfo = element.attr('http-equiv');
			if (redirectionInfo) {
				redirectionUrl = /(?:[\s\S];url=)([\s\S]+)/.exec(element.attr('content'))[1];
			}
		});

		if (redirectionUrl) {
			article = await axios.get(redirectionUrl, {
				headers: AXIOS_HEADER,
			}).then(body => body.data)
				.catch(() => undefined);

			if (!article) {
				msg.error(ERROR.NSFW.HITOMI_NUM_NOT_VALID);
				return;
			}

			$ = cheerio.load(article);
		}

		meta.cover = $('.cover').find('img').attr('src');
		// it's missing protocol
		meta.cover = `http:${meta.cover}`;

		const summary = $('.gallery');
		meta.title = summary.find('h1').text().trim();
		meta.artist = summary.find('h2').text().trim();

		const details = $('tr');
		meta.details = {};
		details.each(function() {
			const detailWrapper = $(this);
			const info = [];
			detailWrapper.find('td').each(function(idx) {
				const infoElement = $(this);
				const infoText = infoElement.text()
					.trim().split('\n')
					.map(text => text.trim())
					.filter(text => text)
					.join(', ');
				info[idx] = infoText ? infoText : 'N/A';
			});
			meta.details[info[0]] = info[1];
		});

		const embed = new MessageEmbed()
			.setTitle(meta.title)
			.setDescription(meta.artist)
			.setURL(HITOMI.ARTICLE_URL(articleNum))
			.setFooter(articleNum.toString())
			.setImage(meta.cover);
		for (const type in meta.details) {
			embed.addField(type, meta.details[type], true);
		}

		channel.send(embed);
	},
};
