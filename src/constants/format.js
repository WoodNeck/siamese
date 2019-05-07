const EMOJI = require('@/constants/emoji');
const { strong, code } = require('@/utils/markdown');


module.exports = {
	ERROR_MSG: user => `${user.toString()}냥, `,
	MUSIC_PROGRESS: (progressed, total) => {
		const totalPlaytime = 3600 * total.hours + 60 * total.minutes + total.seconds;
		const progressedTime = 3600 * progressed.hours + 60 * progressed.minutes + progressed.seconds;
		// Make sure it's in 0 ~ 9
		const ratio_10 = Math.round((progressedTime / totalPlaytime) * 10).clamp(0, 9);
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
	PLAYLIST_ENTRY: (index, song) => `${strong(index.toString())}. ${song.emoji} ${strong(song.title)} ${song.duration ? code(musicLengthWithClock(song.duration)) : ''}`,
	DATE: date => `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`,
	PAGE: {
		CURRENT: '{CURRENT}',
		TOTAL: '{TOTAL}',
	},
	FLAG: iso => `${EMOJI.LETTER[iso[0].toUpperCase()]}${EMOJI.LETTER[iso[1].toUpperCase()]}`,
};

const musicLength = duration => `${duration.hours * 60 + duration.minutes}:${('0' + duration.seconds).slice(-2)}`;
const musicLengthWithClock = duration => `${EMOJI.CLOCK_3}${musicLength(duration)}`;
