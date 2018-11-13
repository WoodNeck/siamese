const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const { strong } = require('@/utils/markdown');


module.exports = {
	PING: {
		CMD: '핑',
		DESC: '퐁을 대답해용!',
		MSG: (ping, bot, guild, uptime) => dedent`
			퐁이에용! 현재 API 서버와의 핑은 ${ping}에용!
			${bot.user.toString()}${Josa.c(bot.getNameIn(guild), '은/는')} ${uptime.hours}시간 ${uptime.minutes}분 ${uptime.seconds}초동안 일하고 있어용!`,
	},
	INVITE: {
		CMD: '초대',
		DESC: '봇을 초대할 수 있는 링크를 드려용!',
		MSG: (botMention, link) => `${botMention}의 초대 링크에용!\n${link}`,
	},
	HELP: {
		CMD: '도움',
		DESC: '명령어 목록을 표시해용!',
		RECITAL_TIME: 30,
	},
	DICE: {
		CMD: '주사위',
		DESC: 'n면짜리 주사위를 굴려용! (기본값: 100)',
		USAGE: '[n]',
		MIN: 2,
		MAX: 10000,
		DEFAULT: 100,
		MSG: (user, num, maxNum) => {
			// Korean josa for number 0-9
			const josa = ['이', '이', '가', '이', '가', '가', '이', '이', '이', '가'];
			const numStr = num.toString();
			return `${user.toString()}님이 주사위를 굴려 🎲${strong(numStr)}${josa[num % 10]} 나왔어용! (1-${maxNum})`;
		},
	},
	CHOOSE: {
		CMD: '골라줘',
		DESC: '주신 항목들 중 하나를 임의로 골라드려용!',
		USAGE: '항목1 항목2 [항목3...]',
	},
	SAY: {
		CMD: '따라해',
		DESC: '하신 말을 지운 후에 따라해용!',
		USAGE: '따라할 문장',
	},
	DEV_SERVER: {
		CMD: '개발서버',
		DESC: '개발 서버로 오실 수 있는 초대 링크를 드려용!',
		INVITE_LINK: (bot, invite) => dedent`
			${bot.user.toString()}의 개발 서버 초대 링크를 드릴게용!
			오셔서 사용/개발에 관한 질문, 기능요청, 버그제보 등을 하실 수 있어용!
			${invite}`,
	},
};
