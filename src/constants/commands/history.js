const dedent = require('@/utils/dedent');
const { strong } = require('@/utils/markdown');


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
		FORCES: {
			21: {

			},
			23: {

			},
			24: {

			},
		},
	},
	DISCHARGE_ADD: {
		CMD: '추가해줘',
		DESC: '새로운 전역일 정보를 추가한다냥!',
		USAGE: '이름',
		NAME_MAX_LENGTH: 10,
		CONVERSATION_TIME: 30,
		PROMPT_TIME: 30,
		FORCES_LENGTH: {
			'육군': 21,
			'의경': 21,
			'해병': 21,
			'해군': 23,
			'해경': 23,
			'의방': 23,
			'공군': 24,
			'공익': 24,
		},

		NAME_ALREADY_EXISTS: name => `${name}의 전역일 정보는 이미 존재한다냥, 수정할거냥?`,
		SHORT_INFO: info => dedent`
			입대일: ${info.joinDate.getFullYear()}년 ${info.joinDate.getMonth() + 1}월 ${info.joinDate.getDay()}일
			군별: ${info.force}`,
		DIALOGUE_JOIN_DATE_TITLE: name => `${name}의 전역일 정보를 추가한다냥!`,
		DIALOGUE_JOIN_DATE_DESC: '먼저, YYYY/MM/DD의 형식으로 입대일을 알려달라냥!',
		DIALOGUE_JOIN_DATE_EXAMPLE: '예) 2013/1/2',
		DIALOGUE_FORCES_TITLE: '다음으로, 군별을 알려달라냥! 다음 중 하나를 골라달라냥!',
		DIALOGUE_FORCES_EXAMPLE: function() {
			return `${Object.keys(this.FORCES_LENGTH).join(', ')}`;
		},

		SUCCESS: name => `${strong(name)}의 정보를 추가했다냥!`,
	},
};
