const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const EMOJI = require('@/constants/emoji');
const { strong } = require('@/utils/markdown');


module.exports = {
	PING: {
		CMD: '핑',
		DESC: '퐁을 대답한다냥!',
		MSG: (ping, bot, guild, uptime) => dedent`
			퐁이다냥! 현재 API 서버와의 핑은 ${ping}다냥!
			${bot.user.toString()}${Josa.c(bot.getNameIn(guild), '은/는')} ${uptime.hours}시간 ${uptime.minutes}분 ${uptime.seconds}초동안 일하고 있다냥!`,
	},
	INVITE: {
		CMD: '초대',
		DESC: '봇을 초대할 수 있는 링크를 준다냥!',
		MSG: (botMention, link) => `${botMention}의 초대 링크다냥!\n${link}`,
	},
	HELP: {
		CMD: '도움',
		DESC: '명령어 목록을 보여준다냥!',
		RECITAL_TIME: 30,
	},
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
	DEV_SERVER: {
		CMD: '개발서버',
		DESC: '개발 서버로 올 수 있는 초대 링크를 준다냥!',
		INVITE_LINK: (bot, invite) => dedent`
			${bot.user.toString()}의 개발 서버 초대 링크다냥!
			와서 사용/개발에 관한 질문, 기능요청, 버그제보 등을 할 수 있다냥!
			${invite}`,
	},
	ANNOUNCE: {
		CMD: '공지',
		MESSAGE_TITLE: `${EMOJI.LOUD_SPEAKER} 공지사항이 도착했다냥!`,
	},
	GUILDLIST: {
		CMD: '서버목록',
		GUILD_ENTRY: guild => dedent`
		${guild.systemChannel ? EMOJI.GREEN_CHECK : EMOJI.CROSS} - ${guild.name}(${guild.members.size}명)`,
	},
};
