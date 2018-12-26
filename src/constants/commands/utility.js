const Josa = require('josa-js');
const dedent = require('@/utils/dedent');
const { strong } = require('@/utils/markdown');
const EMOJI = require('@/constants/emoji');


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
		TARGET: '따라할 문장',
	},
	ANNOUNCE: {
		CMD: '공지',
		MESSAGE_TITLE: `${EMOJI.LOUD_SPEAKER} 공지사항이 도착했다냥!`,
		PROMPT_TIME: 30,
	},
	ANNOUNCE_CHANNEL: {
		CMD: '공지채널',
		DESC: '현재 채널을 공지사항을 받는 채널으로 설정한다냥!',
		MSG_SET: channel => `${channel.toString()}${Josa.c(channel.name, '을/를')} 이 서버의 공지채널으로 설정했다냥!`,
		MSG_DELETE: '이 서버의 공지채널을 제거했다냥!',
	},
	ANNOUNCE_LISTEN: {
		CMD: '공지수신',
		DESC: '현재 서버의 공지 수신 여부를 설정한다냥!',
		MSG_ABLE: '공지 메시지를 받도록 설정했다냥!',
		MSG_DISABLE: '이제 더 이상 공지 메시지를 받지 않는다냥!',
	},
	BUG_REPORT: {
		CMD: '버그제보',
		DESC: '개발서버로 봇의 버그를 제보한다냥!',
		USAGE: '버그내용(자세히)',
		TARGET: '말할 내용',
		TITLE_CONFIRM: '이렇게 제보하면 되겠냥?',
		MSG_SUCCESS: `${EMOJI.GREEN_CHECK} 개발서버로 버그를 제보했다냥!`,
		MSG_CANCEL: `${EMOJI.CROSS} 메시지 전송을 취소했다냥`,
		PROMPT_TIME: 30,
	},
	FEATURE_REQUEST: {
		CMD: '기능제안',
		DESC: '개발서버에 봇의 기능을 제안한다냥!',
		USAGE: '기능(자세히)',
		TARGET: '말할 내용',
		TITLE_CONFIRM: '이렇게 제안하면 되겠냥?',
		MSG_SUCCESS: `${EMOJI.GREEN_CHECK} 개발서버로 기능을 제안했다냥!`,
		MSG_CANCEL: `${EMOJI.CROSS} 메시지 전송을 취소했다냥`,
		PROMPT_TIME: 30,
	},
	VOTE: {
		CMD: '투표',
		DESC: '채널 내에서 간단한 투표를 할 수 있다냥!',
		USAGE: '제목',
		TARGET: '투표 제목',
		CONVERSATION_TIME: 120,
		OPTIONS_TITLE: '투표 항목들을 말해달라냥!',
		OPTIONS_DESC: '콤마(,)로 항목들을 구분해서, 최소 2개에서 9개까지 투표 항목들을 말해달라냥!',
		OPTIONS_FOOTER: '예) 옵션1, 옵션2, 옵션3',
		DURATION_TITLE: '투표를 몇 분동안 하면 될까냥?',
		DURATION_DESC: dedent`
			투표를 종료하기까지 시간을 분 단위로 말해달라냥!
			최소 1분에서 최대 1440분(하루)까지 가능하다냥!`,
		DURATION_FOOTER: '예) 30',
		DURATION_MAX: 1440,
		HELP_DESC: dedent`
			투표를 시작한다냥! 번호 이모지를 클릭해서 투표하라냥!
			각자 가장 마지막에 클릭한 이모지가 최종 투표 항목이 된다냥!`,
		RESULT_DESC: '투표 결과가 나왔다냥!',
		TITLE: title => `${EMOJI.THINKING} ${title}`,
		AUTHOR: name => `${name}의 투표`,
		COUNT: cnt => `${cnt}표`,
	},
};
