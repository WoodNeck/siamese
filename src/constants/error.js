const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const { strong, underline } = require('@/utils/markdown');


module.exports = {
	CMD_FAILED: '명령어 실행에 실패했어용!',
	CMD_INFORM_SIMILAR: (user, similar) => dedent`
		${user.toString()}님, 그런 명령어는 없어용. 혹시 ${underline(strong(similar))}${Josa.c(similar, '을/를')} 원하신건가용?`,
	DICE: {
		ARG_INCORRECT: (min, max) => `${min}에서 ${max}사이의 숫자를 주세용!`,
	},
	CHOOSE: {
		ARG_NOT_SUFFICIENT: '고를 수 있는 항목을 충분히 주세용!',
	},
	SAY: {
		EMPTY_CONTENT: '따라할 문장을 주세용!',
	},
	SEARCH: {
		EMPTY_CONTENT: '검색할 내용을 주세용!',
		EMPTY_RESULT: target => `그 검색어로는 ${target}${Josa.c(target, '을/를')} 하나도 찾을수가 없었어용!`,
	},
	MUSIC: {
		JOIN_VOICE_CHANNEL_FAILED: '음성채널 참가에 실패했어용!',
		JOIN_VOICE_CHANNEL_FIRST: '음성 채널에 들어가 있어야만 사용할 수 있는 명령어에용!',
		NO_VOICE_CHANNEL_IN: '제가 들어가있는 음성 채널이 없어용!',
	},
};
