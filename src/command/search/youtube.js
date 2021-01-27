const axios = require('axios');
const YouTube = require('simple-youtube-api');
const Recital = require('~/utils/recital');
const { StringPage } = require('~/utils/page');
const ERROR = require('~/const/error');
const PERMISSION = require('~/const/permission');
const FORMAT = require('~/const/format');
const { YOUTUBE } = require('~/const/commands/search');
const { COOLDOWN } = require('~/const/type');


const api = new YouTube(global.env.GOOGLE_API_KEY);
// Override dependency's make function to support escaping characters like '#'
api.request.make = function(endpoint, qs = {}) {
	qs = Object.assign({ key: this.youtube.key }, qs);
	return axios.get(YOUTUBE.API_SEARCH_URL(endpoint), {
		params: qs,
	}).then(body => body.data);
};

module.exports = {
	name: YOUTUBE.CMD,
	description: YOUTUBE.DESC,
	usage: YOUTUBE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
		PERMISSION.CONNECT,
		PERMISSION.SPEAK,
	],
	api: api,
	cooldown: COOLDOWN.PER_USER(3),
	execute: async context => {
		const { bot, msg, channel, content } = context;
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		channel.startTyping();

		const searchText = content;
		let videos = await api.searchVideos(
			searchText,
			YOUTUBE.MAX_RESULTS
		);

		if (!videos.length) {
			msg.error(ERROR.SEARCH.EMPTY_RESULT(YOUTUBE.TARGET));
			return;
		}

		const getVideoDetail = async video => video.fetch();
		const getAllVideoDetails = videos.map(video => getVideoDetail(video));

		videos = await Promise.all(getAllVideoDetails);

		const recital = new Recital(bot, msg);
		const pages = videos.map(video => {
			const videoLengthStr = video.duration
				? FORMAT.MUSIC_LENGTH(video.duration)
				: YOUTUBE.TIME_NOT_DEFINED;

			return new StringPage()
				.setTitle(YOUTUBE.VIDEO_URL_WITH_TIME(video.id, videoLengthStr));
		});
		recital.book.addPages(pages);

		recital.start(YOUTUBE.RECITAL_TIME);
	},
};
