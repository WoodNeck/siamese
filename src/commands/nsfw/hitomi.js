const axios = require('axios');
const cheerio = require('cheerio');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { HITOMI } = require('@/constants/commands/nsfw');
const { RECITAL_END } = require('@/constants/type');
const { AXIOS_HEADER } = require('@/constants/header');


module.exports = {
	name: HITOMI.CMD,
	description: HITOMI.DESC,
	usage: HITOMI.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	execute: async ({ bot, channel, msg, content }) => {
		if (!channel.nsfw) {
			msg.error(ERROR.NSFW.NOT_NSFW_CHANNEL);
			return;
		}

		if (!/^[0-9]*$/.test(content)) {
			msg.error(ERROR.NSFW.HITOMI_PROVIDE_INTEGER_ONLY);
			return;
		}

		await channel.startTyping();

		const articleNum = parseInt(content, 10);

		// All errors, like 404 error will return undefined
		const article = await axios.get(HITOMI.ARTICLE_URL(articleNum), {
			headers: AXIOS_HEADER,
		}).then(body => body.data)
			.catch(() => undefined);

		if (!article) {
			msg.error(ERROR.NSFW.HITOMI_NUM_NOT_VALID);
			return;
		}

		const meta = {};
		const $ = cheerio.load(article);
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

		const recital = new Recital(bot, msg);
		const page = new EmbedPage()
			.setTitle(meta.title)
			.setDescription(meta.artist)
			.setUrl(HITOMI.ARTICLE_URL(articleNum))
			.setFooter(articleNum.toString())
			.setImage(meta.cover);
		for (const type in meta.details) {
			page.addField(type, meta.details[type], true);
		}
		recital.book.addPage(page);
		recital.removeReactionCallback(EMOJI.ARROW_LEFT);
		recital.removeReactionCallback(EMOJI.ARROW_RIGHT);

		recital.addReactionCallback(EMOJI.PLAY, async () => {
			const readRecital = new Recital(bot, msg);
			readHitomi(articleNum, meta, readRecital);
			return RECITAL_END.DELETE_ALL_MESSAGES;
		}, 0);
		recital.start(HITOMI.PREVIEW_RECITAL_TIME);
	},
};

const readHitomi = async (articleNum, meta, recital) => {
	// All errors, like 404 error will return undefined
	const reader = await axios.get(HITOMI.READER_URL(articleNum), {
		headers: AXIOS_HEADER,
	}).then(body => body.data);

	const $ = cheerio.load(reader);
	const IMAGE_URL = (articleNum % 2)
		? HITOMI.IMAGE_URL_ODD
		: HITOMI.IMAGE_URL_EVEN;

	const images = $('.img-url').map(function() {
		const element = $(this);
		const preloadUrl = element.text();
		// Get the image name only
		const imageName = preloadUrl.slice(preloadUrl.lastIndexOf('/') + 1);
		return imageName;
	}).toArray().map(imageName => IMAGE_URL(articleNum, imageName));

	const pages = images.map(imageUrl => new EmbedPage()
		.setTitle(HITOMI.READER_TITLE(meta.title, articleNum))
		.setImage(imageUrl)
	);

	recital.book.addPages(pages);
	recital.start(HITOMI.READER_RECITAL_TIME);
};
