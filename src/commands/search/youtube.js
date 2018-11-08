const axios = require('axios');
const { parse } = require('iso8601-duration');
const Song = require('@/music/song');
const Recital = require('@/utils/recital');
const { StringPage } = require('@/utils/page');
const { play } = require('@/music/music');
const ERROR = require('@/constants/error');
const EMOJI = require('@/constants/emoji');
const PERMISSION = require('@/constants/permission');
const { DEV } = require('@/constants/message');
const { YOUTUBE } = require('@/constants/command');
const { RECITAL, MUSIC_TYPE } = require('@/constants/type');


module.exports = {
	name: YOUTUBE.CMD,
	description: YOUTUBE.DESC,
	usage: YOUTUBE.USAGE,
	hidden: false,
	devOnly: false,
	permission: [
		PERMISSION.VIEW_CHANNEL,
		PERMISSION.SEND_MESSAGES,
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
		PERMISSION.CONNECT,
		PERMISSION.SPEAK,
	],
	checkLoadable: async () => {
		if (!global.env.YOUTUBE_KEY) {
			throw new Error(DEV.API_KEY_MISSING);
		}
		await axios.get(YOUTUBE.SEARCH_URL, {
			params: YOUTUBE.SEARCH_PARAMS('TEST'),
		}).then(body => {
			const result = body.data;
			if (!result.pageInfo || !result.pageInfo.totalResults) {
				throw new Error(DEV.API_TEST_EMPTY_RESULT);
			}
		}).catch(err => { throw err; });
	},
	execute: async context => {
		const { bot, msg, channel, content } = context;
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		await channel.startTyping();

		const searchText = content;
		const videos = await axios.get(YOUTUBE.SEARCH_URL, {
			params: YOUTUBE.SEARCH_PARAMS(searchText),
		}).then(body => {
			return body.data.items.map(video => {
				return {
					id: video.id.videoId,
					title: video.snippet.title,
				};
			});
		});

		if (!videos || !videos.length) {
			msg.error(ERROR.SEARCH.EMPTY_RESULT(YOUTUBE.TARGET));
			return;
		}

		const videoIds = videos.map(video => video.id);
		// Get video length
		const videoLengths = await axios.get(YOUTUBE.DETAIL_URL, {
			params: YOUTUBE.DETAIL_PARAMS(videoIds.join(',')),
		}).then(body => {
			return body.data.items.reduce((mapped, videoInfo) => {
				const videoLength = parse(videoInfo.contentDetails.duration);
				videoLength.toString = function() {
					return `${EMOJI.CLOCK_3}${this.hours * 60 + this.minutes}:${('0' + this.seconds).slice(-2)}`;
				};
				return mapped.set(videoInfo.id, videoLength);
			}, new Map());
		});

		const recital = new Recital(bot, msg);
		const pages = videos.map(video => {
			const videoLengthStr = videoLengths.has(video.id)
				? videoLengths.get(video.id).toString()
				: YOUTUBE.TIME_NOT_DEFINED;

			return new StringPage()
				.setTitle(YOUTUBE.VIDEO_URL_WITH_TIME(video.id, videoLengthStr))
				.setData({
					url: YOUTUBE.VIDEO_URL(video.id),
					title: video.title,
					length: videoLengths.has(video.id)
						? videoLengths.get(video.id)
						: undefined,
				});
		});
		recital.book.addPages(pages);
		recital.addReactionCallback(EMOJI.PLAY, () => {
			const video = recital.currentData;
			const song = new Song(video.url, MUSIC_TYPE.YOUTUBE, {
				title: video.title,
				length: video.length,
			});

			play(context, song);
			return RECITAL.END_AND_DELETE_ALL_MESSAGES;
		}, 1);
		recital.start(YOUTUBE.RECITAL_TIME);
	},
};
