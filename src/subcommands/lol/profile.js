const axios = require('axios');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');

const dedent = require('@/utils/dedent');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { LOL } = require('@/constants/commands/game');
const { AXIOS_HEADER } = require('@/constants/header');
const { COOLDOWN } = require('@/constants/type');


module.exports = {
	name: LOL.PROFILE.CMD,
	description: LOL.PROFILE.DESC,
	usage: LOL.PROFILE.USAGE,
	hidden: false,
	devOnly: false,
	cooldown: COOLDOWN.PER_USER(10),
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ctx => {
		const { msg, channel, content } = ctx;
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		channel.startTyping();

		const userName = content;
		const profile = await axios.get(LOL.PROFILE.URL.OVERALL(userName), {
			headers: AXIOS_HEADER,
		}).then(body => {
			const $ = cheerio.load(body.data);
			const isNotExist = $('.SummonerNotFoundLayout');
			if (isNotExist.length) {
				return null;
			}
			const profileInfo = {};

			const layout = $('.SummonerLayout');

			// Basic infos
			const header = layout.find('.Header');

			const profileImageUrl = header.find('.ProfileImage').attr('src');
			profileInfo.thumb = `http:${profileImageUrl}`;

			const level = header.find('.Level').text().trim();
			profileInfo.level = level;

			const pastRankList = header.find('.PastRankList');
			profileInfo.pastRanks = pastRankList.length
				? pastRankList.children().map((_, rank) => $(rank).text().trim()).toArray()
				: [];

			const profileEl = header.find('.Profile');
			const name = profileEl.find('.Name').text();
			profileInfo.name = name;

			const ladderRank = profileEl.find('.LadderRank');
			profileInfo.ladderRank = ladderRank.find('.ranking').text();
			profileInfo.ladderPercentage = ladderRank.text().match(/(\d+.)*\d+%/);
			profileInfo.ladderPercentage = profileInfo.ladderPercentage && profileInfo.ladderPercentage[0];

			const lastUpdate = header.find('.LastUpdate').text().trim();
			profileInfo.lastUpdate = lastUpdate;

			// Ranks
			const tier = layout.find('.TierBox');
			const tierMedal = tier.find('.Medal img').attr('src');
			const tierRankInfo = tier.find('.TierRankInfo');
			const rankType = tierRankInfo.find('.RankType').text().trim();
			const tierRank = tierRankInfo.find('.TierRank').text().trim();

			const tierInfo = tierRankInfo.find('.TierInfo');
			const leaguePoints = tierInfo.find('.LeaguePoints').text().trim();
			const winLose = tierInfo.find('.WinLose');
			const win = winLose.find('.wins').text().trim();
			const lose = winLose.find('.losses').text().trim();
			const winRatio = winLose.find('.winratio').text().trim();

			const leagueName = tierRankInfo.find('.LeagueName').text().trim();

			profileInfo.tier = {
				medal: tierMedal ? `http:${tierMedal}` : '',
				rankType,
				rank: tierRank,
				leagueName,
				leaguePoints,
				win,
				lose,
				winRatio,
			};

			// Stats
			const stats = layout.find('.GameAverageStats');
			const recentMatches = stats.find('.WinRatioTitle');
			const recentTotal = recentMatches.find('.total').text().trim();
			const recentWin = recentMatches.find('.win').text().trim();
			const recentLose = recentMatches.find('.lose').text().trim();

			const kda = stats.find('div.KDA');
			const kill = kda.find('.Kill').text().trim();
			const death = kda.find('.Death').text().trim();
			const assist = kda.find('.Assist').text().trim();

			profileInfo.stats = {
				recentMatches: {
					total: recentTotal,
					win: recentWin,
					lose: recentLose,
					kill,
					death,
					assist,
				},
			};

			return profileInfo;
		}).catch(() => null);

		if (!profile) {
			msg.error(ERROR.SEARCH.USER_NOT_FOUND);
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor(profile.name, profile.thumb, LOL.PROFILE.URL.OVERALL(userName))
			.setDescription(dedent`
				${LOL.PROFILE.MSG.LEVEL(profile.level)}
				${LOL.PROFILE.MSG.LADDER(profile.ladderRank, profile.ladderPercentage)}
			`)
			.setThumbnail(profile.tier.medal)
			.setFooter(profile.lastUpdate)
			.setColor(COLOR.BOT)
			.addField(profile.tier.rankType, LOL.PROFILE.MSG.TIER(profile.tier))
			.addField(LOL.PROFILE.MSG.RECENT_MATCHES, LOL.PROFILE.MSG.RECENT_STAT(profile.stats.recentMatches));
		channel.send(embed);
	},
};
