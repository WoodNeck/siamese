const dedent = require('@/utils/dedent');
const { strong } = require('@/utils/markdown');
const EMOJI = require('@/constants/emoji');
const FORMAT = require('@/constants/format');


module.exports = {
	RANDOM: {
		CMD: '랜덤',
		DESC: '이 채널의 랜덤한 메시지를 보여준다냥!',
		MSG_FETCH_LIMIT: 100,
	},
	DISCHARGE: {
		CMD: '전역일',
		DESC: '전역일 정보를 확인한다냥!',
		USAGE: '이름',
		SHORTEN_AFTER_THIS_DATE: new Date(2018, 10 - 1, 1),
		FORCE_INFO: {
			육군: { duration: 21, maxShortenMonth: 3 },
			의경: { duration: 21, maxShortenMonth: 3 },
			해병: { duration: 21, maxShortenMonth: 3 },
			해군: { duration: 23, maxShortenMonth: 3 },
			해경: { duration: 23, maxShortenMonth: 3 },
			의방: { duration: 23, maxShortenMonth: 3 },
			공군: { duration: 24, maxShortenMonth: 2 },
			공익: { duration: 24, maxShortenMonth: 3 },
		},
		TITLE: name => `${name}의 전역일 정보다냥!`,
		DETAILED: '자세한 정보',
		PROGRESS_EMOJI: percent => `${EMOJI.SPARKLING_HEART.repeat(percent)}${EMOJI.BLACK_HEART.repeat(100 - percent)}`,
		FORCE_DETAIL: force => `군별: ${force}`,
		SHORTEN_DATE: days => `단축일수: ${days}일`,
		JOIN_DATE: date => `입대일자: ${FORMAT.DATE(date)}`,
		DISCHARGE_DATE: date => `전역일자: ${FORMAT.DATE(date)}`,
		DAYS_PROGRESSED: days => `복무한 날: ${days}일`,
		DAYS_LEFT: days => `남은 날: ${days}일`,
		PERCENTAGE: percent => `복무율: ${percent.toFixed(1)}%`,
	},
	DISCHARGE_ADD: {
		CMD: '추가해줘',
		DESC: '새로운 전역일 정보를 추가한다냥!',
		USAGE: '이름',
		NAME_MAX_LENGTH: 10,
		CONVERSATION_TIME: 30,
		PROMPT_TIME: 30,
		FORCES: [
			'육군', '의경', '해병',
			'해군', '해경', '의방',
			'공군', '공익',
		],

		NAME_ALREADY_EXISTS: name => `${name}의 전역일 정보는 이미 존재한다냥, 수정할거냥?`,
		SHORT_INFO: info => dedent`
			입대일: ${info.joinDate.getFullYear()}년 ${info.joinDate.getMonth() + 1}월 ${info.joinDate.getDate()}일
			군별: ${info.force}`,
		DIALOGUE_JOIN_DATE_TITLE: name => `${name}의 전역일 정보를 추가한다냥!`,
		DIALOGUE_JOIN_DATE_DESC: '먼저, YYYY/MM/DD의 형식으로 입대일을 알려달라냥!',
		DIALOGUE_JOIN_DATE_EXAMPLE: '예) 2013/1/2',
		DIALOGUE_FORCES_TITLE: '다음으로, 군별을 알려달라냥! 다음 중 하나를 골라달라냥!',
		DIALOGUE_FORCES_EXAMPLE: function() {
			return `${this.FORCES.join(', ')}`;
		},

		SUCCESS: name => `${strong(name)}의 정보를 추가했다냥!`,
	},
};
