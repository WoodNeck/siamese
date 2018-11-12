const Youtube = require('@/commands/search/youtube');
const { aquirePlayer } = require('@/music/helper');
const Song = require('@/music/song');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { PLAY } = require('@/constants/commands/music');
const { YOUTUBE } = require('@/constants/commands/search');
const { DEV } = require('@/constants/message');
const { MUSIC_TYPE } = require('@/constants/type');


module.exports = {
	name: PLAY.CMD,
	description: PLAY.DESC,
	usage: PLAY.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.MANAGE_MESSAGES,
		PERMISSION.CONNECT,
		PERMISSION.SPEAK,
	],
	checkLoadable: async () => {
		if (!global.env.YOUTUBE_KEY) {
			throw new Error(DEV.API_KEY_MISSING);
		}
	},
	execute: async context => {
		const { author, content, msg, channel } = context;
		if (!content.length) {
			msg.error(ERROR.MUSIC.NOT_RESOLVABLE);
			return;
		}
		await channel.startTyping();

		const ytVideoRegex = /(?:.+?)?(?:\/v\/|watch\/|\?v=|&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/i;
		const ytPlaylistRegex = /[&?]list=([^&]+)/i;


		if (ytPlaylistRegex.test(content)) {
			msg.delete();
			const playlistId = content.match(ytPlaylistRegex)[1];
			Youtube.api.getPlaylistByID(playlistId)
				.then(async playlist => {
					let videos = await playlist.getVideos();
					const getVideoDetail = async video => video.fetch();
					const getAllVideoDetails = videos.map(video => getVideoDetail(video));

					videos = await Promise.all(getAllVideoDetails);
					const songs = videos.map(video => new Song(
						YOUTUBE.VIDEO_URL(video.id),
						MUSIC_TYPE.YOUTUBE,
						video.title,
						video.duration,
						author
					));

					const player = await aquirePlayer(context);
					if (player) {
						player.enqueueList({
							title: playlist.title,
							length: songs.length,
							songs: songs,
						}, channel);
					}
				})
				.catch(() => {
					msg.error(ERROR.MUSIC.FAILED_TO_PLAY);
				});
		}
		else if (ytVideoRegex.test(content)) {
			// Video check should be after playlist test
			// As playlist url typed https://www.youtube.com/watch?v=VIDEO_ID&list=LIST_ID
			// Can be handled both in video/playlist
			msg.delete();
			Youtube.api.getVideo(content)
				.then(async video => {
					const player = await aquirePlayer(context);
					if (player) {
						const song = new Song(
							YOUTUBE.VIDEO_URL(video.id),
							MUSIC_TYPE.YOUTUBE,
							video.title,
							video.duration,
							author
						);
						player.enqueue(song, channel);
					}
				})
				.catch(() => {
					msg.error(ERROR.MUSIC.FAILED_TO_PLAY);
				});
		}
		else {
			msg.error(ERROR.MUSIC.NOT_RESOLVABLE);
			return;
		}
	},
};
