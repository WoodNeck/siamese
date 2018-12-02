const EMOJI = require('@/constants/emoji');
const { strong } = require('@/utils/markdown');


module.exports = {
	DICE: {
		CMD: '주사위',
		DESC: 'n면짜리 주사위를 굴린다냥! (기본값: 100)',
		USAGE: '[n]',
		MIN: 2,
		MAX: 10000,
		DEFAULT: 100,
		MSG: (user, num, maxNum) => {
			// Korean josa for number 0-9
			const josa = ['이', '이', '가', '이', '가', '가', '이', '이', '이', '가'];
			const numStr = num.toString();
			return `${user.toString()}냥이 주사위를 굴려 🎲${strong(numStr)}${josa[num % 10]} 나왔다냥! (1-${maxNum})`;
		},
	},
	CHOOSE: {
		CMD: '골라줘',
		DESC: '받은 항목들 중 하나를 임의로 골라준다냥!',
		USAGE: '항목1 항목2 [항목3...]',
	},
	SAY: {
		CMD: '따라해',
		DESC: '해준 말을 지운 후에 따라한다냥!',
		USAGE: '따라할 문장',
	},
	ANNOUNCE: {
		CMD: '공지',
		MESSAGE_TITLE: `${EMOJI.LOUD_SPEAKER} 공지사항이 도착했다냥!`,
		PROMPT_TIME: 30,
	},
};
