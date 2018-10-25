const axios = require('axios');
const { parse } = require('iso8601-duration');
const Recital = require('@/utils/recital');
const { StringPage } = require('@/utils/page');


module.exports = lang => {
	const { EMOJI, YOUTUBE, SEARCH } = require('@/constants')(lang);

	return {
		name: YOUTUBE.CMD,
		description: YOUTUBE.DESC,
		usage: YOUTUBE.USAGE,
		hidden: false,
		devOnly: false,
		checkLoadable: async () => {
			if (!global.env.YOUTUBE_KEY) return false;
			const apiAvailability = await axios.get(YOUTUBE.SEARCH_URL('TEST', global.env.YOUTUBE_KEY))
				.then(body => {
					const result = body.data;
					return (result.pageInfo.totalResults) ? true : false;
				})
				.catch(() => { return false; });
			return apiAvailability;
		},
		execute: async ({ bot, msg, channel, content }) => {
			if (!content) {
				msg.reply(SEARCH.ERROR_EMPTY_CONTENT);
				return;
			}
			await channel.startTyping();

			const searchText = encodeURIComponent(content);
			const videos = await axios.get(YOUTUBE.SEARCH_URL(searchText, global.env.YOUTUBE_KEY))
				.then(body => { return body.data; });

			if (!videos.pageInfo.totalResults) {
				msg.reply(SEARCH.ERROR_EMPTY_RESULT(YOUTUBE.TARGET));
				return;
			}

			const videoIds = videos.items.map(video => video.id.videoId);

			// Get video length
			const videoDetails = await axios.get(YOUTUBE.DETAIL_URL(videoIds.join(','), global.env.YOUTUBE_KEY))
				.then(body => { return body.data; });

			const videoLengths = videoDetails.items.reduce((mapped, videoInfo) => {
				const videoLength = parse(videoInfo.contentDetails.duration);
				const videoLengthStr = `${EMOJI.CLOCK_3}${videoLength.hours * 60 + videoLength.minutes}:${('0' + videoLength.seconds).slice(-2)}`;
				return mapped.set(videoInfo.id, videoLengthStr);
			}, new Map());

			const recital = new Recital(bot, msg);
			const pages = videoIds.map(videoId => {
				const videoLengthStr = videoLengths.has(videoId)
					? videoLengths.get(videoId)
					: YOUTUBE.TIME_NOT_DEFINED;
				return new StringPage()
					.setTitle(YOUTUBE.VIDEO_URL(videoId, videoLengthStr));
			});
			recital.book.addPages(pages);
			recital.start(YOUTUBE.RECITAL_TIME);

			await channel.stopTyping();
		},
	};
};
