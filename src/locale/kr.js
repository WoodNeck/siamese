const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const { strong, underline } = require('@/utils/markdown');


module.exports = {
	BOT: {
		READY_TITLE: bot => dedent`
			${bot.user.tag} 일할 준비 됐어용!`,
		READY_DESC: bot => dedent`
			- ${bot.guilds.size}개의 서버에서
			- ${bot.users.filter(user => !user.bot).size}명이 사용 중이에용!`,
		GUILD_JOIN_TITLE: bot => dedent`
			안뇽하세용 ${bot.user.username}에용!`,
		GUILD_JOIN_DESC: (bot, helpCmd) => dedent`
			${underline(strong(helpCmd))}이라고 말해주시면 ${Josa.r(bot.user.username, '이/가')} 할 수 있는 일을 알 수 있어용!`,
		GUILD_JOIN_FOOTER: bot => dedent`
			여기는 ${Josa.r(bot.user.username, '이/가')} 일하는 ${bot.guilds.size}번째 서버에용!`,
		CMD_FAILED: '명령어 실행에 실패했어용!',
		CMD_INFORM_SIMILAR: (user, similar) => dedent`
			${user.toString()}님, 그런 명령어는 없어용. 혹시 ${underline(strong(similar))}${Josa.c(similar, '을/를')} 원하신건가용?`,
	},
	// Command Categories
	UTILS: {
		NAME: '유틸리티',
	},
	// Commands
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
		ERROR_ARG_INCORRECT: (user, min, max) => `${user.toString()}님, ${min}에서 ${max}사이의 숫자를 주세용!`,
	},
	CHOOSE: {
		CMD: '골라줘',
		DESC: '주신 항목들 중 하나를 임의로 골라드려용!',
		USAGE: '항목1 항목2 [항목3] [...]',
		ERROR_ARG_NOT_SUFFICIENT: (user) => `${user.toString()}님, 고를 수 있는 항목을 충분히 주세용!`,
	},
};
