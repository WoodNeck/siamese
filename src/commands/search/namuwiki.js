const axios = require('axios');
const cheerio = require('cheerio');
const { RichEmbed } = require('discord.js');
const { strong, strike, code, blockMd } = require('@/utils/markdown');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { NAMUWIKI } = require('@/constants/commands/search');
const { MESSAGE_MAX_LENGTH } = require('@/constants/discord');
const { AXIOS_HEADER } = require('@/constants/header');
const { COOLDOWN } = require('@/constants/type');

module.exports = {
	name: NAMUWIKI.CMD,
	description: NAMUWIKI.DESC,
	usage: NAMUWIKI.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_USER(5),
	execute: async ({ bot, msg, channel, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		await channel.startTyping();

		const searchText = encodeURIComponent(content).replace(/%2F/g, '/');
		const document = await axios.get(NAMUWIKI.SEARCH_URL(searchText), {
			headers: AXIOS_HEADER,
		}).then(body => body)
			// 404(Document not found)
			.catch(() => {
				const embed = new RichEmbed()
					.setTitle(ERROR.SEARCH.EMPTY_RESULT(NAMUWIKI.TARGET))
					.setImage(NAMUWIKI.NOT_FOUND_URL)
					.setFooter(decodeURIComponent(searchText), NAMUWIKI.ICON_URL)
					.setColor(COLOR.ERROR);
				channel.send(embed);
			});
		if (!document) return;

		const $ = cheerio.load(document.data);
		const article = $('article');
		const recital = new Recital(bot, msg);

		const title = article.find('.title').text().trim();
		const categories = article.find('.wiki-category')
			.text()
			.split('\n')
			.filter(str => str)
			.splice(1);

		// Find unordered paragraphs
		const innerContent = article.find('.wiki-inner-content');
		const unorderedParagraphs = innerContent.children('p')
			.filter((idx, el) => {
				return el.children.length >= 2 || (el.children[0] && el.children[0].name !== 'br');
			})
			.map((idx, el) => {
				const footnoteRefs = $(el).find('.wiki-fn-content')
					.map((_, fnRef) => {
						// Could be string, not only numbers
						const footnoteId = /#fn-(.+)/.exec(fnRef.attribs.href)[1];
						const footnoteText = fnRef.attribs.title;
						return `${EMOJI.STAR}[${footnoteId}]${footnoteText}`;
					}).toArray();
				replaceWithMarkdown($, el);
				return {
					text: $(el).text(),
					refs: footnoteRefs,
				};
			})
			.toArray()
			.filter(paragraph => paragraph && !/^\n+$/.test(paragraph));

		// Table of content
		const tocEl = article.find('.wiki-macro-toc');
		const tocArray = [];
		const traverseToc = (level, el) => {
			el.level = level;
			/toc-indent/.test(el.attribs.class)
				? el.children.forEach(child => traverseToc(level + 1, child))
				: tocArray.push(el);
		};
		if (tocEl.length) {
			tocEl[0].children.forEach(el => traverseToc(0, el));
		}
		const toc = tocArray.map(el => {
			return NAMUWIKI.TOC_ENTRY($, el);
		});

		const titlePage = new EmbedPage()
			.setTitle(NAMUWIKI.TITLE(title))
			.setUrl(`${NAMUWIKI.URL_BASE}${document.request.path}`);

		unorderedParagraphs.push({
			text: blockMd(toc.join('\n')),
			refs: [],
		});

		let titlePageDesc = '';
		let titlePageRefs = [];
		for (const paragraph of unorderedParagraphs) {
			if (titlePageDesc.length + paragraph.text.length <= MESSAGE_MAX_LENGTH) {
				titlePageDesc = `${titlePageDesc}\n${paragraph.text}`;
				titlePageRefs.push(...paragraph.refs);
			}
			else {
				titlePage.setDescription(titlePageDesc);
				titlePage.setFooter([
					NAMUWIKI.CATEGORY(categories),
					titlePageRefs.join('\n'),
				].join('\n'), NAMUWIKI.ICON_URL);

				recital.book.addPage(titlePage);

				titlePageDesc = '';
				titlePageRefs = [];
			}
		}

		titlePage.setDescription(titlePageDesc);
		titlePage.setFooter([
			NAMUWIKI.CATEGORY(categories),
			titlePageRefs.join('\n'),
		].join('\n'), NAMUWIKI.ICON_URL);

		recital.book.addPage(titlePage);

		// Traverse and find contents with heading
		const orderedParagraphs = innerContent.find('.wiki-heading-content')
			.each((idx, el) => {
				let heading = $(el.previousSibling).text();
				// It formatted with [편집]
				heading = heading.substr(0, heading.length - 4);
				el.heading = heading;
			})
			.children()
			.map((idx, el) => {
				// Find footnote reference
				const footnoteRefs = $(el).find('.wiki-fn-content')
					.map((_, fnRef) => {
						// Could be string, not only numbers
						const footnoteId = /#fn-(.+)/.exec(fnRef.attribs.href)[1];
						const footnoteText = fnRef.attribs.title;
						return `${EMOJI.STAR}[${footnoteId}]${footnoteText}`;
					}).toArray();

				if (el.name === 'p') {
					replaceWithMarkdown($, el);
					return {
						heading: el.parent.heading,
						text: $(el).text(),
						refs: footnoteRefs,
					};
				}
				else if (el.name === 'ul') {
					const liText = $(el).find('p')
						.map((_, paragraph) => {
							replaceWithMarkdown($, paragraph);
							return `${EMOJI.SMALL_WHITE_SQUARE}${$(paragraph).text()}`;
						}).toArray().join('\n');
					return {
						heading: el.parent.heading,
						text: liText,
						refs: footnoteRefs,
					};
				}
				// Tables, etc
				return;
			})
			.toArray()
			.filter(paragraph => paragraph && paragraph.text && !/^\n+$/.test(paragraph.text));
		orderedParagraphs.forEach(paragraph => {
			if (paragraph.text.length <= MESSAGE_MAX_LENGTH) {
				recital.book.addPage(
					new EmbedPage()
						.setTitle(NAMUWIKI.TITLE(title))
						.setDescription(paragraph.text)
						.setFooter([
							paragraph.heading,
							paragraph.refs.join('\n'),
						].join('\n'), NAMUWIKI.ICON_URL)
				);
			}
			else {
				const pagesNeeded = Math.ceil(paragraph.text.length / MESSAGE_MAX_LENGTH);
				for (let i = 0; i < pagesNeeded; i++) {
					recital.book.addPage(
						new EmbedPage()
							.setTitle(NAMUWIKI.TITLE(title))
							.setDescription(paragraph.text.substr(MESSAGE_MAX_LENGTH * i, MESSAGE_MAX_LENGTH))
							.setFooter([
								paragraph.heading,
								paragraph.refs.join('\n'),
							].join('\n'), NAMUWIKI.ICON_URL)
					);
				}
			}
		});

		recital.start(NAMUWIKI.RECITAL_TIME);
	},
};


const replaceWithMarkdown = ($, el) => {
	el = $(el);
	el.find('br').each((idx, child) => {
		child = $(child);
		child.replaceWith('\n');
	});
	el.find('strong').each((idx, child) => {
		child = $(child);
		child.replaceWith(`${strong(child.text())}`);
	});
	el.find('del').each((idx, child) => {
		child = $(child);
		child.replaceWith(`${strike(child.text())}`);
	});
	el.find('.wiki-fn-content').each((idx, child) => {
		child = $(child);

		child.html(`${code(EMOJI.STAR)}${child.html()}`);

	});
	// Escape images
	el.find('noscript').each((idx, child) => {
		child = $(child);
		child.replaceWith('');
	});
};
