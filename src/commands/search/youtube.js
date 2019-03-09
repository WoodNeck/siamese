const axios = require('axios');
const YouTube = require('simple-youtube-api');
const Song = require('@/music/song');
const Recital = require('@/utils/recital');
const { StringPage } = require('@/utils/page');
const { aquirePlayer } = require('@/music/helper');
const ERROR = require('@/constants/error');
const EMOJI = require('@/constants/emoji');
const PERMISSION = require('@/constants/permission');
const FORMAT = require('@/constants/format');
const { YOUTUBE } = require('@/constants/commands/search');
const { RECITAL_END, MUSIC_TYPE, COOLDOWN } = require('@/constants/type');


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
		const { bot, author, msg, channel, content } = context;
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
				.setTitle(YOUTUBE.VIDEO_URL_WITH_TIME(video.id, videoLengthStr))
				.setData(new Song(
					YOUTUBE.VIDEO_URL(video.id),
					MUSIC_TYPE.YOUTUBE,
					video.title,
					video.duration,
					author
				));
		});
		recital.book.addPages(pages);
		recital.addReactionCallback(EMOJI.PLAY, async () => {
			const song = recital.currentData;
			const player = await aquirePlayer(context);

			if (player) {
				await player.enqueue(song, channel);
			}
			return RECITAL_END.DELETE_ALL_MESSAGES;
		}, 1);

		recital.start(YOUTUBE.RECITAL_TIME);
	},
};
