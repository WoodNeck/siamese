const axios = require('axios');
const { Parser } = require('htmlparser2');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { IMAGE } = require('@/constants/command');
const { AXIOS_HEADER } = require('@/constants/header');


module.exports = {
	name: IMAGE.CMD,
	description: IMAGE.DESC,
	usage: IMAGE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	execute: async ({ bot, msg, channel, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		await channel.startTyping();

		const searchText = content;
		await axios.get(IMAGE.SEARCH_URL, {
			params: IMAGE.SEARCH_PARAMS(searchText),
			headers: AXIOS_HEADER,
		}).then(body => {
			const images = findAllImages(body.data);
			if (!images.length) {
				msg.error(ERROR.SEARCH.EMPTY_RESULT(IMAGE.TARGET));
				return;
			}

			const recital = new Recital(bot, msg);
			const pages = images.map(imageUrl => {
				return new EmbedPage()
					.setImage(imageUrl);
			});
			recital.book.addPages(pages);
			recital.start(IMAGE.RECITAL_TIME);
		});
	},
};

const findAllImages = data => {
	let metaFlag = false;
	const foundImages = [];
	const parser = new Parser({
		ontext: text => {
			if (metaFlag) {
				const imageMeta = JSON.parse(text);
				foundImages.push(imageMeta.ou);
			}
		},
		onopentag: (name, attrs) => {
			// find a div with rg_meta class
			if (name !== 'div') return;
			if (!attrs.class) return;
			if (attrs.class.split(' ').some(className => className === 'rg_meta')) {
				metaFlag = true;
			}
		},
		onclosetag: () => {
			metaFlag = false;
		},
	});

	parser.write(data);
	parser.end();

	return foundImages;
};
