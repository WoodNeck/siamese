const axios = require('axios');
const cheerio = require('cheerio');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { WOW } = require('@/constants/commands/game');
const { AXIOS_HEADER } = require('@/constants/header');
const { RECITAL_END, COOLDOWN } = require('@/constants/type');


const insideQuotesRegex = /"([^"]+)"/;

module.exports = {
	name: WOW.PROFILE.CMD,
	description: WOW.PROFILE.DESC,
	usage: WOW.PROFILE.USAGE,
	hidden: false,
	devOnly: false,
	cooldown: COOLDOWN.PER_USER(5),
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ctx => {
		const { bot, msg, channel, content } = ctx;
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		await channel.startTyping();

		const username = content;
		const users = await axios.get(WOW.USER_SEARCH_URL, {
			params: WOW.USER_SEARCH_PARAM(username),
			headers: AXIOS_HEADER,
		}).then(body => {
			const $ = cheerio.load(body.data);
			const characters = $('a.Character');
			return characters.map((idx, el) => {
				const character = $(el);
				const url = `${WOW.PROFILE.BASE_URL}${character.attr('href')}`;
				const avatar = character
					.find('.Character-avatar')
					.find('.Avatar-image')
					.attr('style');
				const avatarURL = avatar
					? insideQuotesRegex.exec(avatar)[1]
					: undefined;
				const detail = character.find('.Character-details');
				const name = detail.find('.Character-name').text();
				const level = detail.find('.Character-level').text();
				const realm = detail.find('.Character-realm').text();

				return {
					url,
					avatarURL,
					name,
					level,
					realm,
				};
			}).toArray();
		}).catch(() => undefined);

		if (!users.length) {
			msg.error(ERROR.WOW.USER_NOT_FOUND);
			return;
		}

		const selectRecital = new Recital(bot, msg);
		const userPages = users.map(
			user => new EmbedPage()
				.setTitle(`${user.name} - ${user.realm}`)
				.setThumbnail(user.avatarURL)
				.setDescription(user.level)
				.setData(user)
		);
		selectRecital.book.addPages(userPages);
		selectRecital.addReactionCallback(EMOJI.GREEN_CHECK, async () => {
			const user = selectRecital.currentData;

			checkDetailedProfile(ctx, user);

			return RECITAL_END.DELETE_ALL_MESSAGES;
		}, 1);

		selectRecital.start(WOW.PROFILE.SELECT_TIME);
	},
};

const checkDetailedProfile = async (ctx, user) => {
	const { bot, msg, channel } = ctx;

	await channel.startTyping();

	// username doesn't have %2F
	user.url = user.url.substring(0, user.url.lastIndexOf('/') + 1)
		+ encodeURIComponent(user.name);

	const userDetail = await axios.get(user.url, {
		headers: AXIOS_HEADER,
	}).then(body => {
		const $ = cheerio.load(body.data);

		const header = $('.CharacterHeader');

		const logo = header.find('.Logo--alliance').length > 0
			? WOW.LOGO_ALLIANCE
			: header.find('.Logo--horde').length > 0
				? WOW.LOGO_HORDE
				: '';
		const achievement = header.find('.CharacterHeader-achievement').text();
		const ilvl = header.find('.CharacterHeader-ilvl').text();
		const details = header.find('.CharacterHeader-details').text();

		const profile = $('.CharacterProfile');

		const profileImage = /\(([^()]+)\)/.exec(
			profile
				.find('.CharacterProfile-image')
				.find('.Art-image')
				.attr('style')
		)[1];

		const stats = [];
		$('.StatDetails-basic-section').each((idx, el) => {
			// For some reason it has twice StatDetails-basic-section
			if (idx % 2) return;
			const stat = $(el);
			const detail = stat.children();
			stats.push({
				name: $(detail[0]).text(),
				value: $(detail[1]).text(),
			});
		});

		// Items
		const itemImages = profile.find('.CharacterProfile-item')
			.map((idx, el) => {
				el = $(el);
				const link = $(el.find('.Link'));
				const iconEl = $(el.find('.GameIcon-icon'));
				const style = iconEl.attr('style');
				return {
					part: link.data('modal'),
					icon: style
						? insideQuotesRegex.exec(style)[1]
						: WOW.PROFILE.ITEM_FALLBACK_URL[idx],
				};
			})
			.toArray();

		// Item infos
		const items = $('.CharacterProfile-tooltips').find('.Modal')
			.map((idx, el) => {
				el = $(el);
				const part = el.data('modal');
				const name = el.find('h3').text();
				const spec = $(el.find('.item-specs')[0]);
				spec.find('.icon-gold').each((_, money) => {
					money = $(money);
					money.replaceWith(`${EMOJI.GOLD_MEDAL}${money.text()}`);
				});
				spec.find('.icon-silver').each((_, money) => {
					money = $(money);
					money.replaceWith(`${EMOJI.SILVER_MEDAL}${money.text()}`);
				});
				spec.find('.icon-copper').each((_, money) => {
					money = $(money);
					money.replaceWith(`${EMOJI.BRONZE_MEDAL}${money.text()}`);
				});
				const specText = spec.text().replace(/\t/g, '').replace(/\n{2,}/g, '\n');
				return {
					name,
					spec: specText,
					icon: itemImages.find(img => img.part === part).icon,
				};
			})
			.toArray();

		return {
			logo,
			achievement,
			ilvl,
			details,
			profileImage,
			stats,
			items,
		};
	});

	const overviewPage = new EmbedPage()
		.setAuthor(user.name, user.avatarURL, user.url)
		.setImage(userDetail.profileImage)
		.setDescription(WOW.PROFILE.DETAIL(userDetail))
		.setFooter(userDetail.details, userDetail.logo);

	userDetail.stats.forEach(stat => {
		overviewPage.addField(stat.name, stat.value, true);
	});

	const recital = new Recital(bot, msg);
	recital.book.addPage(overviewPage);

	userDetail.items.forEach(item => {
		recital.book.addPage(new EmbedPage()
			.setAuthor(user.name, user.avatarURL, user.url)
			.setThumbnail(item.icon)
			.setDescription(`${item.name}${item.spec}`)
		);
	});

	recital.start(WOW.PROFILE.CHECK_TIME);
};
