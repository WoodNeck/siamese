const EMOJI = require('@/constants/emoji');
const { strong, code } = require('@/utils/markdown');


module.exports = {
	ERROR_MSG: user => `${user.toString()}냥, `,
	MUSIC_PROGRESS: (progressed, total) => {
		const totalPlaytime = 3600 * total.hours + 60 * total.minutes + total.seconds;
		const progressedTime = 3600 * progressed.hours + 60 * progressed.minutes + progressed.seconds;
		const ratio_10 = Math.round((progressedTime / totalPlaytime) * 10);
		const progress = [];
		for(const i of [...Array(10).keys()]) {
			i === ratio_10
				? progress.push(EMOJI.CD)
				: progress.push(EMOJI.SMALL_BLACK_SQUARE);
		}
		return progress.join('');
	},
	MUSIC_LENGTH: duration => code(musicLengthWithClock(duration)),
	MUSIC_LENGTH_NO_CLOCK: duration => musicLength(duration),
	PLAYLIST_ENTRY: (index, song) => `${strong(index.toString())}. ${EMOJI.MUSIC_NOTE} ${strong(song.title)} ${code(musicLengthWithClock(song.duration))}`,
};

const musicLength = duration => `${duration.hours * 60 + duration.minutes}:${('0' + duration.seconds).slice(-2)}`;
const musicLengthWithClock = duration => `${EMOJI.CLOCK_3}${musicLength(duration)}`;
